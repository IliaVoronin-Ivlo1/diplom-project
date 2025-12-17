import logging
import json
import time
import traceback
from datetime import datetime
import psycopg2
import redis
import numpy as np
import pandas as pd
from prophet import Prophet

logger = logging.getLogger(__name__)

class SeasonalityService:
    def __init__(self, redis_client, db_connection):
        self.redis_client = redis_client
        self.db_connection = db_connection
    
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
    
    def _analyze_seasonality(self, time_series_data):
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
        
        if len(df) < 30:
            return None
        
        try:
            import prophet
            import cmdstanpy
            logger.info(f"SeasonalityService[_analyze_seasonality] Prophet version: {prophet.__version__}")
            logger.info(f"SeasonalityService[_analyze_seasonality] DataFrame shape: {df.shape}, columns: {df.columns.tolist()}")
            logger.info(f"SeasonalityService[_analyze_seasonality] Data range: {df['ds'].min()} to {df['ds'].max()}")
            logger.info(f"SeasonalityService[_analyze_seasonality] Price range: {df['y'].min()} to {df['y'].max()}")
            
            try:
                cmdstan_path = cmdstanpy.utils.cmdstan_path()
                logger.info(f"SeasonalityService[_analyze_seasonality] Using CmdStan path: {cmdstan_path}")
                import os
                os.environ['CMDSTAN'] = str(cmdstan_path)
                cmdstanpy.set_cmdstan_path(cmdstan_path)
                
                import prophet.models as pm
                import pathlib
                local_cmdstan = pathlib.Path(pm.__file__).parent / 'stan_model' / 'cmdstan-2.33.1'
                if not local_cmdstan.exists() or not (local_cmdstan / 'makefile').exists():
                    logger.info(f"SeasonalityService[_analyze_seasonality] Bundled CmdStan invalid, using installed: {cmdstan_path}")
                    pm.CmdStanModel.cmdstan_path = str(cmdstan_path)
            except Exception as e:
                logger.warning(f"SeasonalityService[_analyze_seasonality] Could not set CmdStan path: {str(e)}")
            
            model = Prophet(
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=False,
                seasonality_mode='multiplicative',
                stan_backend='CMDSTANPY'
            )
            logger.info(f"SeasonalityService[_analyze_seasonality] Prophet model created, starting fit...")
            model.fit(df)
            logger.info(f"SeasonalityService[_analyze_seasonality] Prophet model fitted successfully")
            
            future = model.make_future_dataframe(periods=0)
            logger.info(f"SeasonalityService[_analyze_seasonality] Future dataframe created, shape: {future.shape}")
            
            forecast = model.predict(future)
            logger.info(f"SeasonalityService[_analyze_seasonality] Forecast completed, shape: {forecast.shape}, columns: {forecast.columns.tolist()}")
        except ImportError as e:
            logger.error(f"SeasonalityService[_analyze_seasonality] Import error: {str(e)}")
            logger.error(f"SeasonalityService[_analyze_seasonality] Traceback: {traceback.format_exc()}")
            return None
        except AttributeError as e:
            logger.error(f"SeasonalityService[_analyze_seasonality] Attribute error: {str(e)}")
            logger.error(f"SeasonalityService[_analyze_seasonality] Model attributes: {dir(model) if 'model' in locals() else 'Model not created'}")
            logger.error(f"SeasonalityService[_analyze_seasonality] Traceback: {traceback.format_exc()}")
            return None
        except Exception as e:
            logger.error(f"SeasonalityService[_analyze_seasonality] Prophet error: {str(e)}")
            logger.error(f"SeasonalityService[_analyze_seasonality] Error type: {type(e).__name__}")
            logger.error(f"SeasonalityService[_analyze_seasonality] Traceback: {traceback.format_exc()}")
            return None
        
        monthly_coefficients = {}
        for month in range(1, 13):
            month_data = forecast[forecast['ds'].dt.month == month]
            if len(month_data) > 0 and 'yearly' in month_data.columns:
                monthly_coefficients[month] = float(month_data['yearly'].mean())
            else:
                monthly_coefficients[month] = 1.0
        
        quarterly_coefficients = {}
        for quarter in range(1, 5):
            quarter_data = forecast[forecast['ds'].dt.quarter == quarter]
            if len(quarter_data) > 0 and 'yearly' in quarter_data.columns:
                quarterly_coefficients[quarter] = float(quarter_data['yearly'].mean())
            else:
                quarterly_coefficients[quarter] = 1.0
        
        weekly_coefficients = {}
        for day in range(0, 7):
            day_data = forecast[forecast['ds'].dt.dayofweek == day]
            if len(day_data) > 0 and 'weekly' in day_data.columns:
                weekly_coefficients[day] = float(day_data['weekly'].mean())
            else:
                weekly_coefficients[day] = 1.0
        
        if 'trend' not in forecast.columns:
            trend_start = df['y'].iloc[0]
            trend_end = df['y'].iloc[-1]
        else:
            trend_start = forecast['trend'].iloc[0]
            trend_end = forecast['trend'].iloc[-1]
        
        trend_direction = 'increasing' if trend_end > trend_start else 'decreasing' if trend_end < trend_start else 'stable'
        trend_strength = abs(trend_end - trend_start) / trend_start if trend_start > 0 else 0.0
        
        trend = {
            'direction': trend_direction,
            'strength': float(trend_strength),
            'current_value': float(trend_end)
        }
        
        anomalies = self._detect_anomalies(df, forecast)
        
        return {
            'monthly_coefficients': monthly_coefficients,
            'quarterly_coefficients': quarterly_coefficients,
            'weekly_coefficients': weekly_coefficients,
            'trend': trend,
            'anomalies': anomalies
        }
    
    def _detect_anomalies(self, df, forecast):
        df_merged = df.merge(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']], on='ds')
        df_merged['residual'] = df_merged['y'] - df_merged['yhat']
        
        mean_residual = df_merged['residual'].mean()
        std_residual = df_merged['residual'].std()
        
        if std_residual == 0:
            return []
        
        threshold = 3 * std_residual
        anomalies = df_merged[
            (df_merged['residual'] > mean_residual + threshold) | 
            (df_merged['residual'] < mean_residual - threshold)
        ]
        
        anomaly_list = []
        for idx, row in anomalies.iterrows():
            anomaly_list.append({
                'date': row['ds'].strftime('%Y-%m-%d'),
                'price': float(row['y']),
                'expected_price': float(row['yhat']),
                'deviation': float(row['residual'])
            })
        
        return anomaly_list
    
    def _save_to_database(self, results, history_id):
        if not results:
            return
        
        query = """
            INSERT INTO seasonality_analysis_results 
            (history_id, article, brand, monthly_coefficients, quarterly_coefficients, 
             weekly_coefficients, trend, anomalies, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """
        
        for result in results:
            cursor = None
            try:
                cursor = self.db_connection.cursor()
                cursor.execute(query, (
                    history_id,
                    result['article'],
                    result['brand'],
                    json.dumps(result['monthly_coefficients']),
                    json.dumps(result['quarterly_coefficients']),
                    json.dumps(result['weekly_coefficients']),
                    json.dumps(result['trend']),
                    json.dumps(result['anomalies']) if result['anomalies'] else None
                ))
                self.db_connection.commit()
            except Exception as e:
                logger.error(f"SeasonalityService[_save_to_database] Error saving {result['article']}/{result['brand']}: {str(e)}")
                if self.db_connection:
                    self.db_connection.rollback()
                continue
            finally:
                if cursor:
                    cursor.close()
    
    def analyze_seasonality(self, history_id=None):
        start_time = time.time()
        
        try:
            combinations = self._get_article_brand_combinations()
            logger.info(f"SeasonalityService[analyze_seasonality] Found {len(combinations)} combinations")
            
            results = []
            processed = 0
            failed = 0
            
            for combination in combinations:
                article = combination['article']
                brand = combination['brand']
                
                try:
                    time_series_raw = self._get_time_series_data(article, brand)
                    if not time_series_raw:
                        logger.warning(f"SeasonalityService[analyze_seasonality] No time series data for {article}/{brand}")
                        failed += 1
                        continue
                    
                    logger.info(f"SeasonalityService[analyze_seasonality] Got {len(time_series_raw)} data points for {article}/{brand}")
                    time_series = self._prepare_time_series(time_series_raw)
                    seasonality_data = self._analyze_seasonality(time_series)
                    
                    if not seasonality_data:
                        logger.warning(f"SeasonalityService[analyze_seasonality] No seasonality data for {article}/{brand}")
                        failed += 1
                        continue
                    
                    result = {
                        'article': article,
                        'brand': brand,
                        **seasonality_data
                    }
                    results.append(result)
                    processed += 1
                    
                    if processed % 10 == 0:
                        logger.info(f"SeasonalityService[analyze_seasonality] Processed {processed}/{len(combinations)}")
                
                except Exception as e:
                    logger.error(f"SeasonalityService[analyze_seasonality] Error processing {article}/{brand}: {str(e)}")
                    failed += 1
                    continue
            
            logger.info(f"SeasonalityService[analyze_seasonality] Total processed: {processed}, failed: {failed}, results: {len(results)}")
            
            if history_id and results:
                logger.info(f"SeasonalityService[analyze_seasonality] Saving {len(results)} results to database")
                self._save_to_database(results, history_id)
            elif history_id and not results:
                logger.warning(f"SeasonalityService[analyze_seasonality] No results to save for history_id {history_id}")
            
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
            logger.error(f"SeasonalityService[analyze_seasonality] Error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }

