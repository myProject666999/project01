import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('shift')
export class Shift extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 50 })
  name: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'planned_hours', type: 'decimal', precision: 4, scale: 2, default: 8.0 })
  plannedHours: number;
}
