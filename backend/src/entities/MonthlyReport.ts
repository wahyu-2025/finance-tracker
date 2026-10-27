import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";

@Entity()
@Index(["user_id", "year", "month"], { unique: true })
export class MonthlyReport {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "int" })
  year!: number;

  @Column({ type: "int" })
  month!: number; // 1 = January, 12 = December

  @Column({ length: 50 })
  month_name!: string; // e.g. "Oktober 2026"

  @Column({ type: "date" })
  start_date!: string; // YYYY-MM-01

  @Column({ type: "date" })
  end_date!: string; // YYYY-MM-31

  @Column("decimal", { precision: 15, scale: 2, default: 0 })
  total_income!: number;

  @Column("decimal", { precision: 15, scale: 2, default: 0 })
  total_expense!: number;

  @Column("decimal", { precision: 15, scale: 2, default: 0 })
  net_savings!: number;

  @Column({ type: "int", default: 0 })
  total_transactions!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
