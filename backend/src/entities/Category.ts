import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn } from 'typeorm';
import { User } from './User';

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', nullable: true })
  user_id!: number | null;

  @ManyToOne(() => User, user => user.categories, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @Column()
  name!: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.EXPENSE
  })
  type!: CategoryType;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
