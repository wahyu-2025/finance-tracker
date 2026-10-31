import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Budget } from "./budgets";
import { Category } from "./Category";

@Entity()
export class BudgetItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  budget_id!: number;

  @Column()
  category_id!: number;

  @ManyToOne(() => Budget, (budget) => budget.budget_items)
  @JoinColumn({ name: "budget_id" })
  budget!: Budget;

  @ManyToOne(() => Category, (category) => category.budgetItems)
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @Column("decimal", { precision: 15, scale: 2 })
  amount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
