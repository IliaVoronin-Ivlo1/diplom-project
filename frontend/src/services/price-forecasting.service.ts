import apiClient from '@/lib/api';

export interface ArticleBrand {
  article: string;
  brand: string;
  label: string;
}

export interface SeasonalityData {
  article: string;
  brand: string;
  monthly_coefficients: Record<number, number>;
  quarterly_coefficients?: Record<number, number>;
  weekly_coefficients?: Record<number, number>;
  trend: {
    direction: string;
    strength: number;
    current_value: number;
  };
  anomalies?: Array<{ date: string; price: number; expected_price: number; deviation: number }>;
}

export interface ForecastData {
  article: string;
  brand: string;
  forecast_data: Array<{ date: string; price: number; confidence_lower?: number; confidence_upper?: number }>;
  accuracy_metrics?: {
    mae?: number;
    mse?: number;
    rmse?: number;
    mape?: number;
  };
  model_info?: Record<string, any>;
}

class PriceForecastingService {
  async getArticleBrandList(type: 'forecasting' | 'seasonality' = 'forecasting'): Promise<ArticleBrand[]> {
    const response = await apiClient.get(`/price-forecasting/article-brand-list?type=${type}`);
    return response.data.data || [];
  }

  async getSeasonalityData(article: string, brand: string): Promise<SeasonalityData> {
    const encodedArticle = encodeURIComponent(article);
    const encodedBrand = encodeURIComponent(brand);
    const response = await apiClient.get(`/price-forecasting/seasonality/${encodedArticle}/${encodedBrand}`);
    return response.data.data;
  }

  async getForecastData(article: string, brand: string): Promise<ForecastData> {
    const encodedArticle = encodeURIComponent(article);
    const encodedBrand = encodeURIComponent(brand);
    const response = await apiClient.get(`/price-forecasting/forecast/${encodedArticle}/${encodedBrand}`);
    return response.data.data;
  }
}

export default new PriceForecastingService();

