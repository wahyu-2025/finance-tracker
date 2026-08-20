import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class CustomRecap {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  name!: string;

  @Column('date')
  start_date!: string; // Using string to easily pass YYYY-MM-DD from frontend, or Date. Date is fine. We will use string for now as it maps to date column in db and typeorm handles it. Let's stick to string for simpler JSON mapping, or Date. TypeORM can use string for 'date'.

  @Column('date')
  end_date!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date;
}
