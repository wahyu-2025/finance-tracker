import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { CategoryType } from "../types/types";
import { BudgetItem } from "./budget-item";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", nullable: true })
  user_id!: number | null;

  @ManyToOne(() => User, (user) => user.categories, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user!: User | null;

  @Column()
  name!: string;

  @Column({
    type: "enum",
    enum: CategoryType,
    default: CategoryType.EXPENSE,
  })
  type!: CategoryType;

  @OneToMany(() => BudgetItem, (budgetItem) => budgetItem.category)
  budgetItems!: BudgetItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
