import { apiGet, apiPost } from '@/lib/api/client';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiPost<AuthResponse>('/auth/login', credentials);
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiPost<AuthResponse>('/auth/register', data);
  },

  async logout(): Promise<void> {
    await apiPost<void>('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    return apiGet<User>('/auth/me');
  },

  async forgotPassword(email: string): Promise<void> {
    await apiPost<void>('/auth/forgot-password', { email });
  },

  async resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    await apiPost<void>('/auth/reset-password', data);
  },
};