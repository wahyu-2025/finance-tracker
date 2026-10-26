import { CategoryType } from "../entities/Category";
import { WalletType } from "../entities/wallet";

interface defaultCategoryProps {
  name: string;
  type: CategoryType;
}

interface defaultWalletProps {
  name: string;
  type: WalletType;
  initial_balance: number;
  balance: number;
}

export const defaultCategory: defaultCategoryProps[] = [
  { name: "Gaji", type: CategoryType.INCOME },
  { name: "Makan & Minum", type: CategoryType.EXPENSE },
  { name: "Transportasi", type: CategoryType.EXPENSE },
  { name: "Belanja", type: CategoryType.EXPENSE },
  { name: "Tagihan", type: CategoryType.EXPENSE },
  { name: "Hiburan", type: CategoryType.EXPENSE },
  { name: "Lain-lain", type: CategoryType.EXPENSE },
];

export const defaultWallet: defaultWalletProps[] = [
  { name: "Cash", type: WalletType.CASH, initial_balance: 0, balance: 0 },
];
