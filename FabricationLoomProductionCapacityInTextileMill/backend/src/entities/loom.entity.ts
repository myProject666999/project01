import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum LoomStatus {
  DISABLED = 0,
  ENABLED = 1,
}

export enum RunningStatus {
  RUNNING = 1,
  STOPPED = 2,
  FAULT = 3,
}

@Entity('loom')
export class Loom extends BaseEntity {
  @Column({ name: 'loom_code', type: 'varchar', length: 50 })
  loomCode: string;

  @Column({ name: 'brand', type: 'varchar', length: 100 })
  brand: string;

  @Column({ name: 'model', type: 'varchar', length: 100, nullable: true })
  model: string;

  @Column({ name: 'location', type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ name: 'install_date', type: 'date', nullable: true })
  installDate: Date;

  @Column({ name: 'max_speed', type: 'int', nullable: true })
  maxSpeed: number;

  @Column({ name: 'rated_capacity', type: 'decimal', precision: 10, scale: 2, nullable: true })
  ratedCapacity: number;

  @Column({ name: 'process_params', type: 'json', nullable: true })
  processParams: Record<string, any>;

  @Column({ name: 'compatible_specs', type: 'json', nullable: true })
  compatibleSpecs: number[];

  @Column({ name: 'maintenance_interval_hours', type: 'int', default: 2000 })
  maintenanceIntervalHours: number;

  @Column({ name: 'total_running_hours', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRunningHours: number;

  @Column({ name: 'last_maintenance_date', type: 'datetime', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ name: 'next_maintenance_date', type: 'datetime', nullable: true })
  nextMaintenanceDate: Date;

  @Column({ name: 'status', type: 'tinyint', default: 1 })
  status: LoomStatus;
}
