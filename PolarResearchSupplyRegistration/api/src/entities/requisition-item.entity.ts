import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Requisition } from './requisition.entity';
import { Supply } from './supply.entity';

@Entity('requisition_item')
@Index(['requisitionId', 'supplyId'], { unique: true })
@Index(['requisitionId'])
@Index(['supplyId'])
export class RequisitionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'requisition_id' })
  requisitionId: number;

  @Column({ name: 'supply_id' })
  supplyId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @ManyToOne(() => Requisition, requisition => requisition.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requisition_id' })
  requisition: Requisition;

  @ManyToOne(() => Supply, supply => supply.requisitionItems)
  @JoinColumn({ name: 'supply_id' })
  supply: Supply;
}
