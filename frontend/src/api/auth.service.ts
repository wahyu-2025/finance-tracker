import api from './axiosInstance';

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
