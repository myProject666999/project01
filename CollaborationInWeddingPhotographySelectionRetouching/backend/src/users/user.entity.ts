import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from '../orders/order.entity';
import { PhotoComment } from '../photo-comments/comment.entity';
import { RetouchTask } from '../retouch/retouch-task.entity';
import { Payment } from '../payments/payment.entity';

export enum UserRole {
  CLIENT = 'client',
  RETOUCHER = 'retoucher',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ name: 'avatar_url', length: 255, nullable: true })
  avatarUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Order, order => order.client)
  orders: Order[];

  @OneToMany(() => PhotoComment, comment => comment.user)
  comments: PhotoComment[];

  @OneToMany(() => RetouchTask, task => task.retoucher)
  retouchTasks: RetouchTask[];

  @OneToMany(() => Payment, payment => payment.user)
  payments: Payment[];
}
