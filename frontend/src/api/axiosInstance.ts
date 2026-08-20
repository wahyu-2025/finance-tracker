import axios, { InternalAxiosRequestConfig } from 'axios';
import { AuthService } from './auth.service';
import { TokenService } from './token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (error: unknown) => void; config: InternalAxiosRequestConfig }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.config.headers['Authorization'] = `Bearer ${token}`;
      prom.resolve(api(prom.config));
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = TokenService.getAccessToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error?.response?.status === 403 &&
      error.response.data?.error_code === 666 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = TokenService.getRefreshToken();
      if (!refreshToken) {
        TokenService.removeTokens();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await AuthService.refreshToken(refreshToken);
        const newAccessToken = response.data.access_token;
        TokenService.setAccessToken(newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        TokenService.removeTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
