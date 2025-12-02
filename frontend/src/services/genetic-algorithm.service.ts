import apiClient from '@/lib/api';

interface ArticleBrandCombination {
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
}

interface Supplier {
  id: number;
  service_name: string;
  name: string;
  fitness_score: number;
  metrics?: {
    avg_price: number;
    success_rate: number;
    avg_delivery_time: number;
    denial_rate: number;
    orders_count: number;
    total_revenue: number;
  };
  article_brand_combinations?: ArticleBrandCombination[];
}

interface GeneticAlgorithmResults {
  success: boolean;
  best_supplier?: Supplier;
  all_suppliers_ranking?: Supplier[];
  suppliers_with_combinations?: Supplier[];
  global_article_brand_ranking?: Array<{
    supplier_id: number;
    supplier_name: string;
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
  }>;
  execution_time?: number;
  timestamp?: string;
  fitness_threshold?: number;
}

interface GeneticAlgorithmResponse {
  results: GeneticAlgorithmResults;
}

class GeneticAlgorithmService {
  async getResultsData(): Promise<GeneticAlgorithmResponse> {
    const response = await apiClient.get('/genetic-algorithm/get-results-data');
    return response.data;
  }

  async getSupplierCombinations(supplierId: number): Promise<{ combinations: ArticleBrandCombination[] | null }> {
    const response = await apiClient.get(`/genetic-algorithm/get-supplier-combinations/${supplierId}`);
    return response.data;
  }
}

export default new GeneticAlgorithmService();
export type { Supplier, ArticleBrandCombination, GeneticAlgorithmResults };

