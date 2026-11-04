import { User } from "./User";
import { Category } from "./Category";
import { Transaction } from "./Transaction";
import { CustomRecap } from "./CustomRecap";
import { Wallet } from "./wallet";
import { MonthlyReport } from "./MonthlyReport";
import { Transfer } from "./Transfer";
import { BudgetItem } from "./budget-item";
import { Budget } from "./budgets";

const entities = [
  User,
  Category,
  Transaction,
  CustomRecap,
  Wallet,
  MonthlyReport,
  Transfer,
  BudgetItem,
  Budget,
];

export {
  User,
  Category,
  Transaction,
  CustomRecap,
  Wallet,
  MonthlyReport,
  Transfer,
  BudgetItem,
  Budget,
  entities,
};
