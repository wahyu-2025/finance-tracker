import api from './axiosInstance';

export interface UserData {
  id?: number;
  email?: string;
  name?: string;
}

export const UserService = {
  getProfile: async () => {
    const response = await api.post('/api/auth/profile');
    return response.data;
  },
  updateProfile: async (data: { fullname: string, email: string }) => {
    const response = await api.post('/api/auth/update-profile', data);
    return response.data;
  }
};
