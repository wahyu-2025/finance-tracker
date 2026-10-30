export enum IsPendingType {
  Y = "Y",
  N = "N",
}
export enum CategoryType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export enum WalletType {
  BANK = "BANK",
  EWALLET = "EWALLET",
  CASH = "CASH",
}

export interface defaultCategoryProps {
  name: string;
  type: CategoryType;
}

export interface defaultWalletProps {
  name: string;
  type: WalletType;
  initial_balance: number;
  balance: number;
}
