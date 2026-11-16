export interface BudgRequestApi {
  name: string;
  start_date: string;
  end_date: string;
}

export interface BudgItemRequestApi {
  name?: string;
  category_id: number;
  amount: number;
}

export interface BudgetItemResponse {
  id: number;
  budget_id: number;
  category_id: number;
  amount: string | number;
  name: string;
  category?: { id: number; name: string; type: "INCOME" | "EXPENSE" } | null;
  usage?: number;
  remaining?: number;
  usage_percentage?: number;
}

export interface BudgetResponse {
  id: number;
  user_id: number;
  name: string;
  start_date: string;
  end_date: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  budget_items?: BudgetItemResponse[];
  total_budget?: number | string;
  total_amount?: number;
  total_usage?: number;
  total_remaining?: number;
  usage_percentage?: number;
}

export interface budgetDetailResponse {
  id: 7;
  user_id: 7;
  name: "November";
  start_date: "2026-11-01";
  end_date: "2026-11-30";
  createdAt: "2026-11-16T11:16:55.405Z";
  updatedAt: "2026-11-16T11:16:55.405Z";
  deletedAt: null;
  budget_items: [
    {
      id: number;
      budget_id: number;
      name: string;
      category_id: number;
      amount: number;
      createdAt: string;
      updatedAt: string;
      category: {
        id: number;
        user_id: number;
        name: string;
        type: "EXPENSE";
        createdAt: string;
        updatedAt: string;
      };
      usage: number;
      remaining: number;
      usage_percentage: number;
    },
  ];
  total_amount: number;
  total_usage: number;
  total_remaining: number;
  usage_percentage: number;
}
