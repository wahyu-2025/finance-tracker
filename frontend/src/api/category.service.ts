import api from "./axiosInstance";

export interface CategoryData {
  id?: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  user_id?: number | null;
}

export const CategoryService = {
  getAll: async () => {
    const response = await api.get("/api/category");
    return response.data;
  },
  create: async (data: CategoryData) => {
    const response = await api.post("/api/category", data);
    return response.data;
  },
  update: async (id: number, name: string, type: string) => {
    const response = await api.put(`/api/category/${id}`, { name, type });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/api/category/${id}`);
    return response.data;
  },
};
