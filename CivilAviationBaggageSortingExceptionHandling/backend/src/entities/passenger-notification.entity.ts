import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Passenger } from './passenger.entity';
import { ExceptionOrder } from './exception-order.entity';

@Entity('passenger_notification')
export class PassengerNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  passenger_id: number;

  @Column({ nullable: true })
  exception_order_id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 20, default: 'SENT' })
  status: string;

  @ManyToOne(() => Passenger)
  @JoinColumn({ name: 'passenger_id' })
  passenger: Passenger;

  @ManyToOne(() => ExceptionOrder)
  @JoinColumn({ name: 'exception_order_id' })
  exception_order: ExceptionOrder;

  @CreateDateColumn()
  sent_at: Date;
}
