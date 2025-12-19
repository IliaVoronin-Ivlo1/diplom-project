import apiClient from '@/lib/api';

interface Supplier {
  supplier_id: number;
  service_name: string;
  supplier_name: string;
  fitness_score: number;
  metrics: {
    avg_price: number;
    success_rate: number;
    avg_delivery_time: number;
    denial_rate: number;
    orders_count: number;
    total_revenue: number;
  };
}

interface ArticleBrand {
  article: string;
  brand: string;
  fitness_score: number;
  metrics: {
    avg_price: number;
    success_rate: number;
    avg_delivery_time: number;
    denial_rate: number;
    orders_count: number;
    total_revenue: number;
  };
  suppliers_ranking?: Supplier[];
}

interface ReverseGeneticAlgorithmResults {
  best_article_brand: ArticleBrand | null;
  all_article_brands_ranking: ArticleBrand[];
  article_brands_with_suppliers: ArticleBrand[];
}

interface ReverseGeneticAlgorithmResponse {
  results: ReverseGeneticAlgorithmResults | null;
}

class ReverseGeneticAlgorithmService {
  async getResultsData(): Promise<ReverseGeneticAlgorithmResponse> {
    const response = await apiClient.get('/reverse-genetic-algorithm/get-results-data');
    return response.data;
  }

  async getArticleBrandSuppliers(article: string, brand: string): Promise<{ suppliers: Supplier[] | null }> {
    const response = await apiClient.post('/reverse-genetic-algorithm/get-article-brand-suppliers', {
      article,
      brand
    });
    return response.data;
  }
}

export default new ReverseGeneticAlgorithmService();
export type { Supplier, ArticleBrand, ReverseGeneticAlgorithmResults };

