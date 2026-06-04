import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('loom_realtime_data')
export class LoomRealtimeData extends BaseEntity {
  @Column({ name: 'loom_id', type: 'int' })
  @Index('idx_loom_time')
  loomId: number;

  @Column({ name: 'timestamp', type: 'datetime' })
  @Index('idx_loom_time')
  @Index('idx_timestamp')
  timestamp: Date;

  @Column({ name: 'meterage', type: 'decimal', precision: 12, scale: 4, default: 0 })
  meterage: number;

  @Column({ name: 'incremental_meters', type: 'decimal', precision: 10, scale: 4, default: 0 })
  incrementalMeters: number;

  @Column({ name: 'running_status', type: 'tinyint' })
  runningStatus: number;

  @Column({ name: 'speed', type: 'int', nullable: true })
  speed: number;

  @Column({ name: 'defective_meters', type: 'decimal', precision: 10, scale: 4, default: 0 })
  defectiveMeters: number;
}
