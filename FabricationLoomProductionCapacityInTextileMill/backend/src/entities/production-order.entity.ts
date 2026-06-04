import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum OrderStatus {
  PENDING_SCHEDULE = 0,
  SCHEDULING = 1,
  IN_PRODUCTION = 2,
  COMPLETED = 3,
  CANCELLED = 4,
}

export enum UrgencyLevel {
  NORMAL = 1,
  URGENT = 2,
  VERY_URGENT = 3,
}

@Entity('production_order')
export class ProductionOrder extends BaseEntity {
  @Column({ name: 'order_no', type: 'varchar', length: 100 })
  orderNo: string;

  @Column({ name: 'customer_name', type: 'varchar', length: 200, nullable: true })
  customerName: string;

  @Column({ name: 'fabric_spec_id', type: 'int' })
  fabricSpecId: number;

  @Column({ name: 'total_length', type: 'decimal', precision: 12, scale: 2 })
  totalLength: number;

  @Column({ name: 'urgency', type: 'tinyint', default: 1 })
  urgency: UrgencyLevel;

  @Column({ name: 'delivery_date', type: 'date', nullable: true })
  deliveryDate: Date;

  @Column({ name: 'status', type: 'tinyint', default: 0 })
  status: OrderStatus;

  @Column({ name: 'priority', type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'remark', type: 'varchar', length: 500, nullable: true })
  remark: string;
}
