import { useCallApi } from "@/hooks/useCallApi";
import { apiConfig } from "@/config/api.config";

const API_URL = apiConfig.financeTrack;

export interface TranscApiForm {
  wallet_id: number;
  category_id: number;
  type: string;
  amount: number;
  is_pending: string;
  transaction_date: string;
  description: string;
}

export interface TranscGetList {
  startDate: string;
  endDate: string;
}

export const UseTranscApi = () => {
  const { Postdata, Getdata, Putdata, Deletedata } = useCallApi();

  const getTransc = async (params: TranscGetList) => {
    const response = await Getdata(`${API_URL}/api/transaction/history`, {
      startDate: params.startDate,
      endDate: params.endDate,
    });
    return response;
  };

  const postTransac = async (data: TranscApiForm) => {
    const response = await Postdata(`${API_URL}/api/transaction/add`, data);

    return response;
  };

  const putTransac = async (id: number, data: TranscApiForm) => {
    const response = await Putdata(
      `${API_URL}/api/transaction/update/${id}`,
      data,
    );
    return response;
  };

  const deleteTransc = async (id: number) => {
    const response = await Deletedata(
      `${API_URL}/api/transaction/delete/${id}`,
    );
    return response;
  };

  const confirmTransc = async (id: number) => {
    const response = await Putdata(`${API_URL}/api/transaction/confirm/${id}`);
    return response;
  };

  return {
    getTransc,
    postTransac,
    putTransac,
    deleteTransc,
    confirmTransc,
  };
};
