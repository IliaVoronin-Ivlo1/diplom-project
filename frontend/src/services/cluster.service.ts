import apiClient from '@/lib/api';

interface Supplier {
  id: number;
  name: string;
  x: number;
  y: number;
}

interface Cluster {
  id: number;
  count: number;
  suppliers: Supplier[];
}

interface ClustersResponse {
  clusters: Cluster[];
}

class ClusterService {
  async getClustersData(): Promise<ClustersResponse> {
    const response = await apiClient.get('/cluster/get-clusters-data');
    return response.data;
  }
}

export default new ClusterService();

