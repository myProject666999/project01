import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Mailing } from './mailing.entity';

export type FeedbackType = 'satisfied' | 'ordered' | 'bargain' | 'discarded';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mailing_id: number;

  @Column({
    type: 'enum',
    enum: ['satisfied', 'ordered', 'bargain', 'discarded']
  })
  feedback_type: FeedbackType;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  order_amount: number;

  @Column({ type: 'date', nullable: true })
  follow_up_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToOne(() => Mailing, mailing => mailing.feedback)
  @JoinColumn({ name: 'mailing_id' })
  mailing: Mailing;
}
