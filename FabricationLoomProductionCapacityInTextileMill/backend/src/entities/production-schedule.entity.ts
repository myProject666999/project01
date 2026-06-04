import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum ScheduleStatus {
  PENDING = 0,
  IN_PRODUCTION = 1,
  COMPLETED = 2,
  PAUSED = 3,
}

@Entity('production_schedule')
export class ProductionSchedule extends BaseEntity {
  @Column({ name: 'order_id', type: 'bigint' })
  @Index('idx_order')
  orderId: number;

  @Column({ name: 'loom_id', type: 'int' })
  @Index('idx_loom_status')
  loomId: number;

  @Column({ name: 'scheduled_length', type: 'decimal', precision: 12, scale: 2 })
  scheduledLength: number;

  @Column({ name: 'completed_length', type: 'decimal', precision: 12, scale: 2, default: 0 })
  completedLength: number;

  @Column({ name: 'scheduled_start_date', type: 'date' })
  @Index('idx_scheduled_date')
  scheduledStartDate: Date;

  @Column({ name: 'scheduled_end_date', type: 'date', nullable: true })
  scheduledEndDate: Date;

  @Column({ name: 'actual_start_date', type: 'datetime', nullable: true })
  actualStartDate: Date;

  @Column({ name: 'actual_end_date', type: 'datetime', nullable: true })
  actualEndDate: Date;

  @Column({ name: 'status', type: 'tinyint', default: 0 })
  @Index('idx_loom_status')
  status: ScheduleStatus;

  @Column({ name: 'queue_position', type: 'int', default: 0 })
  queuePosition: number;
}
