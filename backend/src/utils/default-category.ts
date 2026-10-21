import { CategoryType } from "../entities/Category";

interface defaultCategoryProps {
  name: string;
  type: CategoryType;
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
