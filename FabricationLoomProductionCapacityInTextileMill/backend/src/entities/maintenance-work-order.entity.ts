import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum WorkOrderStatus {
  PENDING = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

@Entity('maintenance_work_order')
export class MaintenanceWorkOrder extends BaseEntity {
  @Column({ name: 'work_order_no', type: 'varchar', length: 100 })
  workOrderNo: string;

  @Column({ name: 'loom_id', type: 'int' })
  @Index('idx_loom')
  loomId: number;

  @Column({ name: 'maintenance_plan_id', type: 'int', nullable: true })
  maintenancePlanId: number;

  @Column({ name: 'maintenance_type', type: 'varchar', length: 50 })
  maintenanceType: string;

  @Column({ name: 'trigger_type', type: 'varchar', length: 50 })
  triggerType: string;

  @Column({ name: 'trigger_running_hours', type: 'decimal', precision: 12, scale: 2, nullable: true })
  triggerRunningHours: number;

  @Column({ name: 'scheduled_date', type: 'date', nullable: true })
  @Index('idx_scheduled_date')
  scheduledDate: Date;

  @Column({ name: 'actual_start_date', type: 'datetime', nullable: true })
  actualStartDate: Date;

  @Column({ name: 'actual_end_date', type: 'datetime', nullable: true })
  actualEndDate: Date;

  @Column({ name: 'status', type: 'tinyint', default: 0 })
  @Index('idx_status')
  status: WorkOrderStatus;

  @Column({ name: 'check_results', type: 'json', nullable: true })
  checkResults: Record<string, any>;

  @Column({ name: 'maintenance_content', type: 'text', nullable: true })
  maintenanceContent: string;

  @Column({ name: 'replaced_parts', type: 'json', nullable: true })
  replacedParts: Record<string, any>[];

  @Column({ name: 'operator', type: 'varchar', length: 100, nullable: true })
  operator: string;

  @Column({ name: 'remark', type: 'varchar', length: 500, nullable: true })
  remark: string;
}
