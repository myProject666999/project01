import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Supply } from './supply.entity';
import { Warehouse } from './warehouse.entity';
import { InventoryRecord } from './inventory-record.entity';
import { StocktakingItem } from './stocktaking-item.entity';

@Entity('inventory_item')
@Index(['supplyId', 'warehouseId', 'batchNo'], { unique: true })
@Index(['supplyId'])
@Index(['warehouseId'])
@Index(['expiryDate'])
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'supply_id' })
  supplyId: number;

  @Column({ name: 'warehouse_id' })
  warehouseId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({ name: 'reserved_quantity', type: 'decimal', precision: 12, scale: 2, default: 0 })
  reservedQuantity: number;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ name: 'batch_no', length: 50, nullable: true })
  batchNo: string;

  @Column({ name: 'last_stock_in', type: 'datetime', nullable: true })
  lastStockIn: Date;

  @Column({ name: 'last_stock_out', type: 'datetime', nullable: true })
  lastStockOut: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Supply, supply => supply.inventoryItems)
  @JoinColumn({ name: 'supply_id' })
  supply: Supply;

  @ManyToOne(() => Warehouse, warehouse => warehouse.inventoryItems)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @OneToMany(() => InventoryRecord, record => record.inventoryItem)
  records: InventoryRecord[];

  @OneToMany(() => StocktakingItem, item => item.inventoryItem)
  stocktakingItems: StocktakingItem[];
}
