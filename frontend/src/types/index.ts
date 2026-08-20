// ============================================================
// Shared types derived from backend entities & controller DTOs
// ============================================================

// --------------- Category ---------------
export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: number;
  user_id: number | null;
  name: string;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// --------------- Transaction ---------------
export interface Transaction {
  id: number;
  user_id: number;
  category_id: number;
  type: CategoryType;
  amount: number; // decimal comes as string from JSON
  transaction_date: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category: Category;
}

// --------------- Transaction History (getHistory response) ---------------
export interface PerCategory {
  category: string;
  total: number;
}

export interface BalanceSummary {
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface TransactionHistoryData {
  balance_summary: BalanceSummary;
  expense_per_category: PerCategory[];
  income_per_category: PerCategory[];
  history: Transaction[];
}

// --------------- User ---------------
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// --------------- Auth ---------------
export interface AuthToken {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  token: AuthToken;
  id: number;
  name: string;
  email: string;
}

// --------------- Custom Recap ---------------
export interface CustomRecap {
  id: number;
  user_id: number;
  name: string;
  start_date: string;
  end_date: string;
  total_income: number;
  total_expense: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// --------------- Generic API response wrapper ---------------
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// --------------- Axios error (for onError callbacks) ---------------
export interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}
