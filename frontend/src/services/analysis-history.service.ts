import apiClient from '@/lib/api';

export interface AnalysisHistoryItem {
  id: number;
  algorithm_name: string;
  algorithm_code: string;
  status: string;
  status_code: string;
  started_at: string;
  updated_at: string | null;
  duration: string | null;
}

export interface AnalysisHistoryPagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface AnalysisHistoryResponse {
  success: boolean;
  data: AnalysisHistoryItem[];
  pagination: AnalysisHistoryPagination;
}

class AnalysisHistoryService {
  async getHistory(date?: string, page: number = 1, status?: string, algorithmName?: string): Promise<AnalysisHistoryResponse> {
    const params: any = { page };
    if (date) {
      params.date = date;
    }
    if (status) {
      params.status = status;
    }
    if (algorithmName) {
      params.algorithm_name = algorithmName;
    }
    
    const response = await apiClient.get<AnalysisHistoryResponse>('/admin/analysis-history', { params });
    return response.data;
  }
}

export default new AnalysisHistoryService();

