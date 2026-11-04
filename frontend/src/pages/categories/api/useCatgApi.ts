import { useCallApi } from "@/hooks/useCallApi";
import { apiConfig } from "@/config/api.config";

const API_URL = apiConfig.financeTrack;

export interface CatgApiForm {
  name: string;
  type: string;
}

export const UseCatgApi = () => {
  const { Postdata, Getdata, Putdata, Deletedata } = useCallApi();

  const getCategory = async () => {
    const response = await Getdata(`${API_URL}/api/category/get-all`);
    return {
      status: response.status,
      message: response.message,
      data: response.data || [],
    };
  };

  const postCategory = async (data: CatgApiForm) => {
    const response = await Postdata(`${API_URL}/api/category/add`, data);
    return response;
  };

  const putCategory = async (id: number, data: CatgApiForm) => {
    const response = await Putdata(
      `${API_URL}/api/category/update/${id}`,
      data,
    );
    return response;
  };

  const deleteCategory = async (id: number) => {
    const response = await Deletedata(`${API_URL}/api/category/delete/${id}`);
    return response;
  };

  return {
    getCategory,
    postCategory,
    putCategory,
    deleteCategory,
  };
};
