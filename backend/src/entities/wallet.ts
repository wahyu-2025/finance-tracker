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
import { User } from "./User";
import { Transaction } from "./Transaction";

export enum WalletType {
  BANK = "BANK",
  EWALLET = "EWALLET",
  CASH = "CASH",
}

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column()
  name!: string;

  @Column("decimal", {
    precision: 15,
    scale: 2,
    default: 0,
  })
  initial_balance!: number;

  @Column("decimal", {
    precision: 15,
    scale: 2,
  })
  balance!: number;

  @Column({
    type: "enum",
    enum: WalletType,
    default: WalletType.CASH,
  })
  type!: WalletType;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions!: Transaction[];
}
