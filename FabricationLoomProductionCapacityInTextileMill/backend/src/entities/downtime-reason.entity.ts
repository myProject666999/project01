import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('downtime_reason')
export class DowntimeReason extends BaseEntity {
  @Column({ name: 'reason_code', type: 'varchar', length: 50 })
  reasonCode: string;

  @Column({ name: 'reason_name', type: 'varchar', length: 100 })
  reasonName: string;

  @Column({ name: 'category', type: 'varchar', length: 50 })
  category: string;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description: string;
}
