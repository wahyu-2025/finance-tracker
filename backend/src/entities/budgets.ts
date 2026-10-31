import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { BudgetItem } from "./budget-item";
import { User } from "./User";

@Entity()
export class Budget {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @ManyToOne(() => User, (user) => user.budgets)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => BudgetItem, (budgetItem) => budgetItem.budget)
  budget_items!: BudgetItem[];

  @Column()
  name!: string;

  @Column({ type: "date" })
  start_date!: string;

  @Column({ type: "date" })
  end_date!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
