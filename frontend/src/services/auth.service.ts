import apiClient from '@/lib/api';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/models/auth.model';

class AuthService {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export default new AuthService();

