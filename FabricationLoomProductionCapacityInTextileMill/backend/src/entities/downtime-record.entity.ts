import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('downtime_record')
export class DowntimeRecord extends BaseEntity {
  @Column({ name: 'loom_id', type: 'int' })
  @Index('idx_loom_time')
  loomId: number;

  @Column({ name: 'shift_id', type: 'int', nullable: true })
  @Index('idx_shift')
  shiftId: number;

  @Column({ name: 'shift_date', type: 'date', nullable: true })
  @Index('idx_shift')
  shiftDate: Date;

  @Column({ name: 'reason_id', type: 'int' })
  @Index('idx_reason')
  reasonId: number;

  @Column({ name: 'start_time', type: 'datetime' })
  @Index('idx_loom_time')
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ name: 'duration_minutes', type: 'int', default: 0 })
  durationMinutes: number;

  @Column({ name: 'operator', type: 'varchar', length: 100, nullable: true })
  operator: string;

  @Column({ name: 'remark', type: 'varchar', length: 500, nullable: true })
  remark: string;
}
