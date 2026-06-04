import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('maintenance_plan')
export class MaintenancePlan extends BaseEntity {
  @Column({ name: 'plan_name', type: 'varchar', length: 100 })
  planName: string;

  @Column({ name: 'maintenance_type', type: 'varchar', length: 50 })
  maintenanceType: string;

  @Column({ name: 'interval_hours', type: 'int' })
  intervalHours: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'check_items', type: 'json', nullable: true })
  checkItems: Record<string, any>[];
}
