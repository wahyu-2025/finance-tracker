// ============================================================
// Shared types derived from backend entities & controller DTOs
// ============================================================

// --------------- Category ---------------
export type CategoryType = "INCOME" | "EXPENSE";

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

// Wallets

export type WalletType = "CASH" | "BANK" | "EWALLET";

export interface WalletList {
  id: number;
  user_id: number;
  name: string;
  initial_balance: number;
  balance: number;
  type: WalletType;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Category

export interface CatgList {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  user_id?: number | null;
}

export interface TranscListForm {
  id: number;
  user_id: number;
  wallet_id: number;
  category_id: number;
  type: "INCOME" | "EXPENSE";
  amount: string;
  transaction_date: string;
  is_pending: "Y" | "N";
  description: string;
  category: { id: number; name: string } | null;
  wallet: { id: number; name: string } | null;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface dateRangeProps {
  startDate: string;
  endDate: string;
}

// HISTORY TYPES

export interface CashFlowSummary {
  total_income: number;
  total_expense: number;
  net_cash_flow: number;
}

export interface BalanceSummary {
  total_income: number;
  total_expense: number;
  balance: number;
}

export interface PendingSummary {
  total_pending_income: number;
  total_pending_expense: number;
  net_pending: number;
  total_pending_count: number;
}

export interface CategorySummary {
  category: string;
  total: number;
}

export interface WalletSummary {
  id: number;
  name: string;
  type: string;
  balance: number;
}

export interface HistoryTransactionCategory {
  id: number;
  user_id?: number | null;
  name: string;
  type?: "INCOME" | "EXPENSE" | string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface HistoryTransactionWallet {
  id: number;
  user_id?: number;
  name: string;
  initial_balance?: string | number;
  balance?: string | number;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface HistoryTransactionItem {
  id: number;
  user_id: number;
  category_id: number;
  wallet_id: number;
  type: CategoryType;
  amount: string | number;
  transaction_date: string;
  is_pending: "Y" | "N";
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  category: Category | null;
  wallet: WalletList | null;
}

export interface HistoryProps {
  total_balance_wallet: number;
  net_cash_flow_summary: CashFlowSummary;
  balance_summary: BalanceSummary;
  pending_summary: PendingSummary;
  expense_per_category: CategorySummary[];
  income_per_category: CategorySummary[];
  wallets: WalletSummary[];
  history: HistoryTransactionItem[];
}