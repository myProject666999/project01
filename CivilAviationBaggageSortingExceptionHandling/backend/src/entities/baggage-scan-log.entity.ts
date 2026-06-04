import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Baggage } from './baggage.entity';

@Entity('baggage_scan_log')
export class BaggageScanLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  baggage_id: number;

  @Column({ length: 50 })
  scan_location: string;

  @Column({ type: 'datetime' })
  scan_time: Date;

  @Column({ length: 50, nullable: true })
  operator: string;

  @ManyToOne(() => Baggage, baggage => baggage.scan_logs)
  @JoinColumn({ name: 'baggage_id' })
  baggage: Baggage;

  @CreateDateColumn()
  created_at: Date;
}
