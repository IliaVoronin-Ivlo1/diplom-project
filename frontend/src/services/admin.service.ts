import apiClient from '@/lib/api';

interface User {
  id: number;
  name: string | null;
  email: string;
  role: string;
  email_verified_at: string | null;
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: PaginationMeta;
}

class AdminService {
  async getUsers(page: number = 1): Promise<UsersResponse> {
    const response = await apiClient.get('/admin/users', {
      params: { page }
    });
    return response.data;
  }

  async updateUser(userId: number, data: { name?: string; role: string }): Promise<{ success: boolean; data: User }> {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data;
  }
}

export default new AdminService();
export type { User, PaginationMeta, UsersResponse };

