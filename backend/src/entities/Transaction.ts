import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn } from 'typeorm';
import { User } from './User';
import { Category, CategoryType } from './Category';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @ManyToOne(() => User, user => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  category_id!: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @Column({
    type: 'enum',
    enum: CategoryType
  })
  type!: CategoryType;

  @Column('decimal', { precision: 15, scale: 2 })
  amount!: number;

  @Column('date')
  transaction_date!: Date;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
