import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('shift_report')
export class ShiftReport extends BaseEntity {
  @Column({ name: 'loom_id', type: 'int' })
  @Index('uk_loom_shift_date', { unique: true })
  loomId: number;

  @Column({ name: 'shift_id', type: 'int' })
  @Index('uk_loom_shift_date', { unique: true })
  shiftId: number;

  @Column({ name: 'shift_date', type: 'date' })
  @Index('uk_loom_shift_date', { unique: true })
  @Index('idx_shift_date')
  shiftDate: Date;

  @Column({ name: 'planned_output', type: 'decimal', precision: 12, scale: 4, default: 0 })
  plannedOutput: number;

  @Column({ name: 'actual_output', type: 'decimal', precision: 12, scale: 4, default: 0 })
  actualOutput: number;

  @Column({ name: 'good_output', type: 'decimal', precision: 12, scale: 4, default: 0 })
  goodOutput: number;

  @Column({ name: 'defective_output', type: 'decimal', precision: 12, scale: 4, default: 0 })
  defectiveOutput: number;

  @Column({ name: 'total_downtime', type: 'int', default: 0 })
  totalDowntime: number;

  @Column({ name: 'downtime_breakdown', type: 'json', nullable: true })
  downtimeBreakdown: Record<string, any>;

  @Column({ name: 'running_hours', type: 'decimal', precision: 6, scale: 2, default: 0 })
  runningHours: number;

  @Column({ name: 'average_speed', type: 'decimal', precision: 8, scale: 2, default: 0 })
  averageSpeed: number;

  @Column({ name: 'oee_id', type: 'bigint', nullable: true })
  @Index('idx_oee')
  oeeId: number;

  @Column({ name: 'operator', type: 'varchar', length: 100, nullable: true })
  operator: string;

  @Column({ name: 'remark', type: 'varchar', length: 500, nullable: true })
  remark: string;
}
