import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Sample } from './sample.entity';
import { Courier } from './courier.entity';
import { Feedback } from './feedback.entity';

export type MailingStatus = 'pending' | 'in_transit' | 'delivered' | 'exception';

@Entity('mailings')
export class Mailing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customer_id: number;

  @Column()
  sample_id: number;

  @Column({ default: 1 })
  quantity: number;

  @Column()
  courier_id: number;

  @Column({ length: 100 })
  tracking_number: string;

  @Column({ type: 'date' })
  mailing_date: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_transit', 'delivered', 'exception'],
    default: 'pending'
  })
  status: MailingStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  shipping_cost: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => Customer, customer => customer.mailings)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Sample, sample => sample.mailings)
  @JoinColumn({ name: 'sample_id' })
  sample: Sample;

  @ManyToOne(() => Courier, courier => courier.mailings)
  @JoinColumn({ name: 'courier_id' })
  courier: Courier;

  @OneToOne(() => Feedback, feedback => feedback.mailing)
  feedback: Feedback;
}
