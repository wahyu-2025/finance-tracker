import { useCallApi } from "@/hooks/useCallApi";
import { apiConfig } from "@/config/api.config";

const API_URL = apiConfig.wallets;

interface WalletForm {
  name: string;
  type: string;
  initial_balance: number;
  balance: number;
}
export const useWalletsApi = () => {
  const { Getdata, Postdata } = useCallApi();

  const getWalletList = async (user_id: number) => {
    const response = await Getdata(`${API_URL}/api/wallet`, {
      user_id: user_id,
    });
    return {
      status: response.status,
      message: response.message,
      data: response.data?.wallets || [],
    };
  };

  const postWallet = async (data: WalletForm) => {
    const response = await Postdata(`${API_URL}/api/wallet`, data);
    return response;
  };
  return {
    getWalletList,
    postWallet,
  };
};
