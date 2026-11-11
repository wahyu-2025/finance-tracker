import api from './axiosInstance';

export interface CustomRecapData {
  name: string;
  start_date: string;
  end_date: string;
}

export interface CustomRecapItem extends CustomRecapData {
  id: number;
  user_id: number;
  total_income: number;
  total_expense: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export const CustomRecapService = {
  create: async (data: CustomRecapData) => {
    const response = await api.post('/api/custom-recap', data);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/api/custom-recap/get-all');
    return response.data;
  },
  getOne: async (id: number) => {
    const response = await api.get(`/api/custom-recap/getById/${id}`);
    return response.data;
  },
  update: async (id: number, data: CustomRecapData) => {
    const response = await api.put(`/api/custom-recap/update/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/custom-recap/delete/${id}`);
    return response.data;
  }
};
