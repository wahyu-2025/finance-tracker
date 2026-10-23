import api from "./axiosInstance";
import { ApiResponse, Wallets } from "@/types";

interface WalletReq {
  user_id: number;
  name: string;
  type: "CASH" | "BANK" | "EWALLET";
  initial_balance: number;
}

export const WalletService = {
  create: async (data: WalletReq) => {
    const response = await api.post("/api/wallet", data);
    return response.data;
  },
  getWallet: async (user_id?: number): Promise<ApiResponse<Wallets[]>> => {
    const response = await api.get("/api/wallet", {
      params: { user_id },
    });
    return response.data;
  },
};
