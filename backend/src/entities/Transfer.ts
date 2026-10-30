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
import { User } from "./User";
import { Wallet } from "./wallet";

@Entity()
export class Transfer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @ManyToOne(() => User, (user) => user.transfers)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column()
  from_wallet_id!: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.transfers_out)
  @JoinColumn({ name: "from_wallet_id" })
  from_wallet!: Wallet;

  @Column()
  to_wallet_id!: number;

  @ManyToOne(() => Wallet, (wallet) => wallet.transfers_in)
  @JoinColumn({ name: "to_wallet_id" })
  to_wallet!: Wallet;

  @Column()
  amount!: number;

  @Column()
  transfer_date!: Date;

  @Column()
  description!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date;
}
