import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks/useCallApi";
import { BudgItemRequestApi, BudgRequestApi } from "../types/budgetsTypes";

const API_URL = apiConfig.financeTrack;

export const UseBudgetApi = () => {
  const { Postdata, Getdata, Deletedata, Putdata } = useCallApi();

  const getBudget = async () => {
    const response = await Getdata(`${API_URL}/api/budget/get-all`);
    return {
      status: response.status,
      message: response.message,
      data: response.data || [],
    };
  };

  const getDetailBudget = async (id: number) => {
    const response = await Getdata(`${API_URL}/api/budget/get-detail/${id}`);
    return response;
  };

  const postBudget = async (data: BudgRequestApi) => {
    const response = await Postdata(`${API_URL}/api/budget/add`, data);
    return response;
  };

  const putBudget = async (id: number, data: BudgRequestApi) => {
    const response = await Putdata(`${API_URL}/api/budget/update/${id}`, data);
    return response;
  };

  const deletedBudget = async (id: number) => {
    const response = await Deletedata(`${API_URL}/api/budget/delete/${id}`);
    return response;
  };

  const postBudgetItem = async (
    budget_id: number,
    data: BudgItemRequestApi,
  ) => {
    const response = await Postdata(
      `${API_URL}/api/budget-items/add/${budget_id}`,
      { budget_items: [data] },
    );
    return response;
  };

  const putBudgetItem = async (id: number, budget_id: number) => {
    const response = await Putdata(
      `${API_URL}/api/budget-items/update/${budget_id}/${id}`,
    );
    return response;
  };

  const deletedBudgetItem = async (budget_id: number, id: number) => {
    const response = await Deletedata(
      `${API_URL}/api/budget-items/delete/${budget_id}/${id}`,
    );
    return response;
  };

  return {
    getBudget,
    getDetailBudget,
    postBudget,
    putBudget,
    deletedBudget,
    postBudgetItem,
    putBudgetItem,
    deletedBudgetItem,
  };
};
