import apiClient from '@/lib/api';

interface SupplierOrderStat {
  supplier_name: string;
  total_orders: number;
  successful_orders: number;
  failed_orders: number;
}

interface SupplierOrdersStatisticsResponse {
  statistics: SupplierOrderStat[];
}

class SupplierOrdersStatisticsService {
  async getSupplierOrdersStatistics(limit: number = 10): Promise<SupplierOrdersStatisticsResponse> {
    const response = await apiClient.get('/statistics/supplier-orders', {
      params: { limit }
    });
    return response.data;
  }
}

export default new SupplierOrdersStatisticsService();
export type { SupplierOrderStat, SupplierOrdersStatisticsResponse };

