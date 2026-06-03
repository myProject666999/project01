import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';
import { InventoryRecordType } from './enums';

@Entity('inventory_record')
@Index(['inventoryItemId'])
@Index(['type'])
@Index(['createdAt'])
@Index(['sourceType', 'sourceId'])
export class InventoryRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inventory_item_id' })
  inventoryItemId: number;

  @Column({ type: 'enum', enum: InventoryRecordType })
  type: InventoryRecordType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ name: 'source_type', length: 50, nullable: true })
  sourceType: string;

  @Column({ name: 'source_id', nullable: true })
  sourceId: number;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => InventoryItem, item => item.records)
  @JoinColumn({ name: 'inventory_item_id' })
  inventoryItem: InventoryItem;
}
