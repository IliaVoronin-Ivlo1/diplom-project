import logging
import json
import time
import traceback
from datetime import datetime, timedelta
import psycopg2
import redis
import numpy as np
import pandas as pd
from prophet import Prophet
import xgboost as xgb
import httpx

logger = logging.getLogger(__name__)

class PriceForecastingService:
    def __init__(self, redis_client, db_connection, seasonality_service_url):
        self.redis_client = redis_client
        self.db_connection = db_connection
        self.seasonality_service_url = seasonality_service_url
    
    def _get_article_brand_combinations(self):
        query = """
            SELECT 
                order_product.article,
                order_product.brand,
                COUNT(order_product.id) as orders_count
            FROM order_product
            WHERE order_product.is_denied = 0 
              AND order_product.is_archived = 0
            GROUP BY order_product.article, order_product.brand
            HAVING COUNT(order_product.id) >= 300
            ORDER BY COUNT(order_product.id) DESC
        """
        
        cursor = self.db_connection.cursor()
        cursor.execute(query)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        cursor.close()
        
        combinations = []
        for row in rows:
            combination = dict(zip(columns, row))
            combinations.append(combination)
        
        return combinations
    
    def _get_time_series_data(self, article, brand):
        query = """
            SELECT 
                DATE(order_product.date_added) as date,
                AVG(order_product.price) as avg_price,
                COUNT(*) as orders_count
            FROM order_product
            WHERE order_product.article = %s
              AND order_product.brand = %s
              AND order_product.is_denied = 0
              AND order_product.is_archived = 0
              AND order_product.date_added IS NOT NULL
            GROUP BY DATE(order_product.date_added)
            ORDER BY date ASC
        """
        
        cursor = self.db_connection.cursor()
        cursor.execute(query, (article, brand))
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        cursor.close()
        
        if len(rows) < 30:
            return None
        
        data = []
        for row in rows:
            data.append({
                'date': row[0],
                'avg_price': float(row[1]) if row[1] else 0.0,
                'orders_count': int(row[2]) if row[2] else 0
            })
        
        return data
    
    def _prepare_time_series(self, raw_data):
        df = pd.DataFrame(raw_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.set_index('date')
        df = df.sort_index()
        
        date_range = pd.date_range(
            start=df.index.min(),
            end=df.index.max(),
            freq='D'
        )
        
        df_reindexed = df.reindex(date_range)
        if 'avg_price' in df_reindexed.columns:
            df_reindexed['avg_price'] = df_reindexed['avg_price'].interpolate(method='linear')
            df_reindexed['avg_price'] = df_reindexed['avg_price'].fillna(method='ffill').fillna(method='bfill')
        if 'orders_count' in df_reindexed.columns:
            df_reindexed['orders_count'] = df_reindexed['orders_count'].fillna(0)
        
        return df_reindexed
    
    def _get_seasonality_data(self, article, brand):
        cache_key = f"seasonality:{article}:{brand}"
        
        cached = self.redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        
        try:
            response = httpx.get(
                f"{self.seasonality_service_url}/analyze",
                params={"article": article, "brand": brand},
                timeout=30.0
            )
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.redis_client.setex(cache_key, 86400, json.dumps(data))
                    return data
        except Exception as e:
            logger.error(f"PriceForecastingService[_get_seasonality_data] Error fetching seasonality: {str(e)}")
        
        return None
    
    def _build_prophet_model(self, time_series_data):
        df = time_series_data.copy()
        df = df.reset_index()
        
        date_col = None
        if 'date' in df.columns:
            date_col = 'date'
        elif df.index.name == 'date':
            df = df.reset_index()
            date_col = 'date'
        else:
            date_col = df.columns[0]
        
        if 'avg_price' not in df.columns:
            return None
        
        df = df[[date_col, 'avg_price']].copy()
        df.columns = ['ds', 'y']
        
        try:
            import prophet
            import cmdstanpy
            logger.info(f"PriceForecastingService[_build_prophet_model] Prophet version: {prophet.__version__}")
            logger.info(f"PriceForecastingService[_build_prophet_model] DataFrame shape: {df.shape}, columns: {df.columns.tolist()}")
            logger.info(f"PriceForecastingService[_build_prophet_model] Data range: {df['ds'].min()} to {df['ds'].max()}")
            logger.info(f"PriceForecastingService[_build_prophet_model] Price range: {df['y'].min()} to {df['y'].max()}")
            
            try:
                cmdstan_path = cmdstanpy.utils.cmdstan_path()
                logger.info(f"PriceForecastingService[_build_prophet_model] Using CmdStan path: {cmdstan_path}")
                import os
                os.environ['CMDSTAN'] = str(cmdstan_path)
                cmdstanpy.set_cmdstan_path(cmdstan_path)
                
                import prophet.models as pm
                import pathlib
                local_cmdstan = pathlib.Path(pm.__file__).parent / 'stan_model' / 'cmdstan-2.33.1'
                if not local_cmdstan.exists() or not (local_cmdstan / 'makefile').exists():
                    logger.info(f"PriceForecastingService[_build_prophet_model] Bundled CmdStan invalid, using installed: {cmdstan_path}")
                    pm.CmdStanModel.cmdstan_path = str(cmdstan_path)
            except Exception as e:
                logger.warning(f"PriceForecastingService[_build_prophet_model] Could not set CmdStan path: {str(e)}")
            
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=False,
                seasonality_mode='multiplicative',
                changepoint_prior_scale=0.05,
                seasonality_prior_scale=10.0,
                stan_backend='CMDSTANPY'
            )
            logger.info(f"PriceForecastingService[_build_prophet_model] Prophet model created, starting fit...")
            model.fit(df)
            logger.info(f"PriceForecastingService[_build_prophet_model] Prophet model fitted successfully")
            return model, df
        except ImportError as e:
            logger.error(f"PriceForecastingService[_build_prophet_model] Import error: {str(e)}")
            logger.error(f"PriceForecastingService[_build_prophet_model] Traceback: {traceback.format_exc()}")
            return None, None
        except AttributeError as e:
            logger.error(f"PriceForecastingService[_build_prophet_model] Attribute error: {str(e)}")
            logger.error(f"PriceForecastingService[_build_prophet_model] Model attributes: {dir(model) if 'model' in locals() else 'Model not created'}")
            logger.error(f"PriceForecastingService[_build_prophet_model] Traceback: {traceback.format_exc()}")
            return None, None
        except Exception as e:
            logger.error(f"PriceForecastingService[_build_prophet_model] Error: {str(e)}")
            logger.error(f"PriceForecastingService[_build_prophet_model] Error type: {type(e).__name__}")
            logger.error(f"PriceForecastingService[_build_prophet_model] Traceback: {traceback.format_exc()}")
            return None, None
    
    def _prepare_xgboost_features(self, time_series_data, prophet_forecast, seasonal_data):
        features = []
        
        for idx, row in prophet_forecast.iterrows():
            date = row['ds']
            
            month_coeff = 1.0
            if seasonal_data and 'monthly_coefficients' in seasonal_data:
                month_coeff = seasonal_data['monthly_coefficients'].get(str(date.month), 1.0)
            
            trend_value = row.get('trend', row['yhat'])
            
            recent_prices = time_series_data['avg_price'].iloc[-30:] if len(time_series_data) >= 30 else time_series_data['avg_price']
            recent_orders = time_series_data['orders_count'].iloc[-30:] if len(time_series_data) >= 30 else time_series_data['orders_count']
            
            feature_vector = [
                row['yhat'],
                trend_value,
                row.get('yearly', 1.0),
                row.get('weekly', 1.0),
                date.month,
                date.quarter,
                date.dayofweek,
                date.dayofyear,
                month_coeff,
                recent_prices.mean() if len(recent_prices) > 0 else 0.0,
                recent_prices.std() if len(recent_prices) > 0 else 0.0,
                recent_orders.mean() if len(recent_orders) > 0 else 0.0,
                (recent_prices.iloc[-1] - recent_prices.iloc[0]) / recent_prices.iloc[0] if len(recent_prices) > 1 else 0.0
            ]
            
            features.append(feature_vector)
        
        return np.array(features)
    
    def _train_xgboost_corrector(self, time_series_data, seasonal_data):
        if len(time_series_data) < 30:
            return None
        
        historical_features = []
        historical_targets = []
        
        for i in range(30, len(time_series_data)):
            window_data = time_series_data.iloc[i-30:i]
            current_date = time_series_data.index[i]
            actual_price = time_series_data.iloc[i]['avg_price']
            
            window_df = window_data.reset_index()
            window_df.columns = ['ds', 'y', 'orders_count']
            window_df = window_df[['ds', 'y']]
            
            try:
                prophet_model = Prophet()
                prophet_model.fit(window_df)
                
                future = prophet_model.make_future_dataframe(periods=1)
                forecast = prophet_model.predict(future)
                prophet_prediction = forecast.iloc[-1]['yhat']
                
                month_coeff = 1.0
                if seasonal_data and 'monthly_coefficients' in seasonal_data:
                    month_coeff = seasonal_data['monthly_coefficients'].get(str(current_date.month), 1.0)
                
                recent_prices = window_data['avg_price']
                recent_orders = window_data['orders_count']
                
                features = [
                    prophet_prediction,
                    forecast.iloc[-1]['trend'],
                    forecast.iloc[-1].get('yearly', 1.0),
                    forecast.iloc[-1].get('weekly', 1.0),
                    current_date.month,
                    current_date.quarter,
                    current_date.dayofweek,
                    current_date.dayofyear,
                    month_coeff,
                    recent_prices.mean() if len(recent_prices) > 0 else 0.0,
                    recent_prices.std() if len(recent_prices) > 0 else 0.0,
                    recent_orders.mean() if len(recent_orders) > 0 else 0.0,
                    (recent_prices.iloc[-1] - recent_prices.iloc[0]) / recent_prices.iloc[0] if len(recent_prices) > 1 else 0.0
                ]
                
                historical_features.append(features)
                historical_targets.append(actual_price)
            except Exception as e:
                continue
        
        if len(historical_features) < 10:
            return None
        
        X = np.array(historical_features)
        y = np.array(historical_targets)
        
        try:
            model = xgb.XGBRegressor(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                random_state=42
            )
            model.fit(X, y)
            return model
        except Exception as e:
            logger.error(f"PriceForecastingService[_train_xgboost_corrector] Error: {str(e)}")
            return None
    
    def _forecast_price(self, article, brand, forecast_days, time_series_data, seasonal_data):
        prophet_result = self._build_prophet_model(time_series_data)
        if not prophet_result or prophet_result[0] is None:
            logger.error(f"PriceForecastingService[_forecast_price] Failed to build Prophet model for {article}/{brand}")
            return None
        
        prophet_model, df = prophet_result
        
        try:
            logger.info(f"PriceForecastingService[_forecast_price] Creating future dataframe for {forecast_days} days")
            future = prophet_model.make_future_dataframe(periods=forecast_days)
            logger.info(f"PriceForecastingService[_forecast_price] Future dataframe created, shape: {future.shape}")
            
            logger.info(f"PriceForecastingService[_forecast_price] Starting prediction...")
            prophet_forecast = prophet_model.predict(future)
            logger.info(f"PriceForecastingService[_forecast_price] Prediction completed, shape: {prophet_forecast.shape}, columns: {prophet_forecast.columns.tolist()}")
        except Exception as e:
            logger.error(f"PriceForecastingService[_forecast_price] Prophet predict error: {str(e)}")
            logger.error(f"PriceForecastingService[_forecast_price] Error type: {type(e).__name__}")
            logger.error(f"PriceForecastingService[_forecast_price] Traceback: {traceback.format_exc()}")
            return None
        
        xgboost_model = self._train_xgboost_corrector(time_series_data, seasonal_data)
        
        if xgboost_model:
            features = self._prepare_xgboost_features(time_series_data, prophet_forecast.tail(forecast_days), seasonal_data)
            xgboost_predictions = xgboost_model.predict(features)
            
            forecast_data = []
            for idx, (_, row) in enumerate(prophet_forecast.tail(forecast_days).iterrows()):
                corrected_price = float(xgboost_predictions[idx])
                confidence_lower = float(row['yhat_lower'])
                confidence_upper = float(row['yhat_upper'])
                
                forecast_data.append({
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'price': corrected_price,
                    'confidence_lower': confidence_lower,
                    'confidence_upper': confidence_upper
                })
        else:
            forecast_data = []
            for _, row in prophet_forecast.tail(forecast_days).iterrows():
                forecast_data.append({
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'price': float(row['yhat']),
                    'confidence_lower': float(row['yhat_lower']),
                    'confidence_upper': float(row['yhat_upper'])
                })
        
        accuracy_metrics = self._calculate_accuracy_metrics(time_series_data, prophet_forecast)
        
        return {
            'forecast_data': forecast_data,
            'accuracy_metrics': accuracy_metrics,
            'model_info': {
                'base_model': 'prophet',
                'correction_model': 'xgboost' if xgboost_model else None
            }
        }
    
    def _calculate_accuracy_metrics(self, time_series_data, prophet_forecast):
        if len(time_series_data) < 15:
            return None
        
        test_data = time_series_data.iloc[-30:]
        forecast_historical = prophet_forecast.iloc[-len(test_data)-30:-30]
        
        if len(forecast_historical) != len(test_data):
            return None
        
        actual = test_data['avg_price'].values
        predicted = forecast_historical['yhat'].values
        
        mae = np.mean(np.abs(actual - predicted))
        mape = np.mean(np.abs((actual - predicted) / actual)) * 100
        rmse = np.sqrt(np.mean((actual - predicted) ** 2))
        
        return {
            'mae': float(mae),
            'mape': float(mape),
            'rmse': float(rmse)
        }
    
    def _save_to_database(self, results, history_id):
        if not results:
            return
        
        query = """
            INSERT INTO price_forecasting_results 
            (history_id, article, brand, forecast_data, accuracy_metrics, model_info, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        
        for result in results:
            cursor = None
            try:
                cursor = self.db_connection.cursor()
                cursor.execute(query, (
                    history_id,
                    result['article'],
                    result['brand'],
                    json.dumps(result['forecast_data']),
                    json.dumps(result['accuracy_metrics']) if result['accuracy_metrics'] else None,
                    json.dumps(result['model_info'])
                ))
                self.db_connection.commit()
            except Exception as e:
                logger.error(f"PriceForecastingService[_save_to_database] Error saving {result['article']}/{result['brand']}: {str(e)}")
                if self.db_connection:
                    self.db_connection.rollback()
                continue
            finally:
                if cursor:
                    cursor.close()
    
    def forecast_prices(self, history_id=None, forecast_days=30):
        start_time = time.time()
        
        try:
            combinations = self._get_article_brand_combinations()
            logger.info(f"PriceForecastingService[forecast_prices] Found {len(combinations)} combinations")
            
            results = []
            processed = 0
            failed = 0
            
            for combination in combinations:
                article = combination['article']
                brand = combination['brand']
                
                try:
                    time_series_raw = self._get_time_series_data(article, brand)
                    if not time_series_raw:
                        failed += 1
                        continue
                    
                    time_series = self._prepare_time_series(time_series_raw)
                    seasonal_data = self._get_seasonality_data(article, brand)
                    
                    forecast_result = self._forecast_price(article, brand, forecast_days, time_series, seasonal_data)
                    
                    if not forecast_result:
                        failed += 1
                        continue
                    
                    result = {
                        'article': article,
                        'brand': brand,
                        **forecast_result
                    }
                    results.append(result)
                    processed += 1
                    
                    if processed % 10 == 0:
                        logger.info(f"PriceForecastingService[forecast_prices] Processed {processed}/{len(combinations)}")
                
                except Exception as e:
                    logger.error(f"PriceForecastingService[forecast_prices] Error processing {article}/{brand}: {str(e)}")
                    failed += 1
                    continue
            
            if history_id and results:
                self._save_to_database(results, history_id)
            
            execution_time = round(time.time() - start_time, 2)
            
            return {
                'success': True,
                'processed': processed,
                'failed': failed,
                'total': len(combinations),
                'results_count': len(results),
                'execution_time': execution_time,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
            
        except Exception as e:
            logger.error(f"PriceForecastingService[forecast_prices] Error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }

