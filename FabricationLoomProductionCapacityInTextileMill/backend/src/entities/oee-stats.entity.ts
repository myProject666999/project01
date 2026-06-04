import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('oee_stats')
export class OeeStats extends BaseEntity {
  @Column({ name: 'loom_id', type: 'int' })
  @Index('uk_loom_shift_date', { unique: true })
  loomId: number;

  @Column({ name: 'shift_id', type: 'int' })
  @Index('uk_loom_shift_date', { unique: true })
  shiftId: number;

  @Column({ name: 'stat_date', type: 'date' })
  @Index('uk_loom_shift_date', { unique: true })
  @Index('idx_stat_date')
  statDate: Date;

  @Column({ name: 'planned_production_time', type: 'int', default: 0 })
  plannedProductionTime: number;

  @Column({ name: 'actual_running_time', type: 'int', default: 0 })
  actualRunningTime: number;

  @Column({ name: 'downtime', type: 'int', default: 0 })
  downtime: number;

  @Column({ name: 'total_output', type: 'decimal', precision: 12, scale: 4, default: 0 })
  totalOutput: number;

  @Column({ name: 'good_output', type: 'decimal', precision: 12, scale: 4, default: 0 })
  goodOutput: number;

  @Column({ name: 'defective_output', type: 'decimal', precision: 12, scale: 4, default: 0 })
  defectiveOutput: number;

  @Column({ name: 'availability_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  availabilityRate: number;

  @Column({ name: 'performance_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  performanceRate: number;

  @Column({ name: 'quality_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityRate: number;

  @Column({ name: 'oee', type: 'decimal', precision: 5, scale: 2, nullable: true })
  oee: number;
}
