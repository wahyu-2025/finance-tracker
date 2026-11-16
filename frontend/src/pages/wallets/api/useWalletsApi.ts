import { useCallApi } from "@/hooks/useCallApi";
import { apiConfig } from "@/config/api.config";

const API_URL = apiConfig.financeTrack;

interface WalletForm {
  name: string;
  type: string;
  initial_balance: number;
  balance: number;
}
export const useWalletsApi = () => {
  const { Getdata, Postdata, Putdata, Deletedata } = useCallApi();

  const getWalletList = async (user_id: number) => {
    const response = await Getdata(`${API_URL}/api/wallet/get`, {
      user_id: user_id,
    });
    return {
      status: response.status,
      message: response.message,
      data: response.data?.wallets || [],
    };
  };

  const postWallet = async (data: WalletForm) => {
    const response = await Postdata(`${API_URL}/api/wallet/add`, data);
    return response;
  };

  const putWallet = async (id: number, data: WalletForm) => {
    const response = await Putdata(`${API_URL}/api/wallet/update/${id}`, data);
    return response;
  };

  const deleteWallet = async (id: number) => {
    const response = await Deletedata(`${API_URL}/api/wallet/delete/${id}`);
    return response;
  };

  return {
    getWalletList,
    postWallet,
    putWallet,
    deleteWallet,
  };
};
