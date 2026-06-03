import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Stocktaking } from './stocktaking.entity';
import { InventoryItem } from './inventory-item.entity';

@Entity('stocktaking_item')
@Index(['stocktakingId', 'inventoryItemId'], { unique: true })
@Index(['stocktakingId'])
@Index(['inventoryItemId'])
export class StocktakingItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stocktaking_id' })
  stocktakingId: number;

  @Column({ name: 'inventory_item_id' })
  inventoryItemId: number;

  @Column({ name: 'book_quantity', type: 'decimal', precision: 12, scale: 2, default: 0 })
  bookQuantity: number;

  @Column({ name: 'actual_quantity', type: 'decimal', precision: 12, scale: 2, nullable: true })
  actualQuantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  difference: number;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Stocktaking, stocktaking => stocktaking.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stocktaking_id' })
  stocktaking: Stocktaking;

  @ManyToOne(() => InventoryItem, item => item.stocktakingItems)
  @JoinColumn({ name: 'inventory_item_id' })
  inventoryItem: InventoryItem;
}
