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
  private articleBrandListCache: { forecasting: ArticleBrand[] | null; seasonality: ArticleBrand[] | null } = {
    forecasting: null,
    seasonality: null
  };
  
  private seasonalityDataCache: Map<string, SeasonalityData> = new Map();
  private forecastDataCache: Map<string, ForecastData> = new Map();

  private getCacheKey(article: string, brand: string): string {
    return `${article}|${brand}`;
  }

  async getArticleBrandList(type: 'forecasting' | 'seasonality' = 'forecasting'): Promise<ArticleBrand[]> {
    if (this.articleBrandListCache[type]) {
      return this.articleBrandListCache[type]!;
    }
    
    const response = await apiClient.get(`/price-forecasting/article-brand-list?type=${type}`);
    const data = response.data.data || [];
    this.articleBrandListCache[type] = data;
    return data;
  }

  async getSeasonalityData(article: string, brand: string): Promise<SeasonalityData> {
    const cacheKey = this.getCacheKey(article, brand);
    
    if (this.seasonalityDataCache.has(cacheKey)) {
      return this.seasonalityDataCache.get(cacheKey)!;
    }
    
    const encodedArticle = encodeURIComponent(article);
    const encodedBrand = encodeURIComponent(brand);
    const response = await apiClient.get(`/price-forecasting/seasonality/${encodedArticle}/${encodedBrand}`);
    const data = response.data.data;
    this.seasonalityDataCache.set(cacheKey, data);
    return data;
  }

  async getForecastData(article: string, brand: string): Promise<ForecastData> {
    const cacheKey = this.getCacheKey(article, brand);
    
    if (this.forecastDataCache.has(cacheKey)) {
      return this.forecastDataCache.get(cacheKey)!;
    }
    
    const encodedArticle = encodeURIComponent(article);
    const encodedBrand = encodeURIComponent(brand);
    const response = await apiClient.get(`/price-forecasting/forecast/${encodedArticle}/${encodedBrand}`);
    const data = response.data.data;
    this.forecastDataCache.set(cacheKey, data);
    return data;
  }

  clearCache(): void {
    this.articleBrandListCache = { forecasting: null, seasonality: null };
    this.seasonalityDataCache.clear();
    this.forecastDataCache.clear();
  }
}

export default new PriceForecastingService();

