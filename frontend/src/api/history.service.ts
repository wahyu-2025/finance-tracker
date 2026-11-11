import { ApiResponse, dateRangeProps, HistoryProps } from "@/types";
import api from "./axiosInstance";

export const HistoryService = {
  getHistory: async (
    params: dateRangeProps,
  ): Promise<ApiResponse<HistoryProps>> => {
    const response = await api.get("/api/get-history", {
      params: { startDate: params.startDate, endDate: params.endDate },
    });
    return response.data;
  },
};
