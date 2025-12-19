import apiClient from '@/lib/api';

class ProfileService {
  async updateName(name: string) {
    const response = await apiClient.put('/profile/update-name', { name });
    return response.data;
  }

  async requestPasswordReset() {
    const response = await apiClient.post('/profile/request-password-reset');
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(email: string, token: string, password: string, passwordConfirmation: string) {
    const response = await apiClient.post(`/profile/reset-password?email=${encodeURIComponent(email)}&token=${token}`, {
      password,
      password_confirmation: passwordConfirmation
    });
    return response.data;
  }
}

export default new ProfileService();

