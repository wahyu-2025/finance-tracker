import { TransactionHistoryProps } from '@/pages/transactions/page';
import api from './axiosInstance';

export interface TransactionData {
  id?: number;
  category_id: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  transaction_date: string;
  description?: string;
}

export const TransactionService = {
  create: async (data: TransactionData) => {
    const response = await api.post('/api/transaction', data);
    return response.data;
  },
  update: async (id: number, data: TransactionData) => {
    const response = await api.put(`/api/transaction/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/transaction/${id}`);
    return response.data;
  },
  getHistory: async (startDate: string, endDate: string): Promise<TransactionHistoryProps> => {
    const response = await api.get('/api/transaction/history', {
      params: { startDate, endDate }
    });
    return response.data;
  }
};
