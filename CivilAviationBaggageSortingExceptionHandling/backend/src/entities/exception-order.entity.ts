import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Baggage } from './baggage.entity';

export enum ExceptionType {
  MISROUTED = 'MISROUTED',
  DELAYED = 'DELAYED',
  DAMAGED = 'DAMAGED',
  LOST = 'LOST',
}

export enum ExceptionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

@Entity('exception_order')
export class ExceptionOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  baggage_id: number;

  @Column({ length: 20 })
  exception_type: string;

  @Column({ length: 20, default: ExceptionStatus.PENDING })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  handler: string;

  @Column({ type: 'datetime', nullable: true })
  sla_deadline: Date;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ type: 'datetime', nullable: true })
  resolved_at: Date;

  @ManyToOne(() => Baggage)
  @JoinColumn({ name: 'baggage_id' })
  baggage: Baggage;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
