import api from './axiosInstance';
import { TokenService } from './token';

export interface LoginData {
  email?: string;
  password?: string;
}

export interface RegisterData {
  fullname?: string;
  email?: string;
  password?: string;
}

export const AuthService = {
  login: async (data: LoginData) => {
    const response = await api.post('/api/auth/login', data);
    const tokenData = response.data?.data?.token;
    
    if (tokenData) {
      TokenService.setTokens(
        tokenData.access_token, 
        tokenData.refresh_token
      );
    }
    return response.data;
  },
  register: async (data: RegisterData) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },
  refreshToken: async (token: string) => {
    const response = await api.post('/api/auth/refresh_token', { refresh_token: token });
    return response.data;
  },
};
