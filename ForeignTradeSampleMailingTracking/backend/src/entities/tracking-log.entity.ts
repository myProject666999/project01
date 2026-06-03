import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Mailing } from './mailing.entity';

export type TrackingStatus = 'pending' | 'in_transit' | 'delivered' | 'exception';

@Entity('tracking_logs')
export class TrackingLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mailing_id: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_transit', 'delivered', 'exception']
  })
  status: TrackingStatus;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  tracked_at: Date;

  @ManyToOne(() => Mailing)
  @JoinColumn({ name: 'mailing_id' })
  mailing: Mailing;
}
