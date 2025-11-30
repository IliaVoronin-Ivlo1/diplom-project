export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ValidationError {
  [key: string]: string[];
}

export interface ErrorResponse {
  message: string;
  errors?: ValidationError;
}

