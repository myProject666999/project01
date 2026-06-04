import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Photo } from '../photos/photo.entity';
import { Payment } from '../payments/payment.entity';

export enum OrderStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  SELECTING = 'selecting',
  RETOUCHING = 'retouching',
  REVIEWING = 'reviewing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_no', unique: true, length: 50 })
  orderNo: string;

  @Column({ name: 'client_id' })
  clientId: number;

  @Column({ name: 'wedding_date', type: 'date', nullable: true })
  weddingDate: Date;

  @Column({ name: 'couple_names', length: 100 })
  coupleNames: string;

  @Column({ name: 'total_photos', default: 0 })
  totalPhotos: number;

  @Column({ name: 'selected_photos', default: 0 })
  selectedPhotos: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'deposit_paid', default: false })
  depositPaid: boolean;

  @Column({ name: 'balance_paid', default: false })
  balancePaid: boolean;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @OneToMany(() => Photo, photo => photo.order)
  photos: Photo[];

  @OneToMany(() => Payment, payment => payment.order)
  payments: Payment[];
}
