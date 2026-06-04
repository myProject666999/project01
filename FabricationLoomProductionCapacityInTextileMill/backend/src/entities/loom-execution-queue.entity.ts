import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum QueueStatus {
  WAITING = 0,
  CURRENT = 1,
  COMPLETED = 2,
}

@Entity('loom_execution_queue')
export class LoomExecutionQueue extends BaseEntity {
  @Column({ name: 'loom_id', type: 'int' })
  @Index('idx_loom_status')
  loomId: number;

  @Column({ name: 'schedule_id', type: 'bigint' })
  @Index('idx_schedule')
  scheduleId: number;

  @Column({ name: 'order_id', type: 'bigint' })
  orderId: number;

  @Column({ name: 'fabric_spec_id', type: 'int' })
  fabricSpecId: number;

  @Column({ name: 'target_length', type: 'decimal', precision: 12, scale: 2 })
  targetLength: number;

  @Column({ name: 'position', type: 'int' })
  position: number;

  @Column({ name: 'status', type: 'tinyint', default: 0 })
  @Index('idx_loom_status')
  status: QueueStatus;
}
