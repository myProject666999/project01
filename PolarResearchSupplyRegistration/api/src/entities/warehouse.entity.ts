import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

@Entity('warehouse')
@Index(['name'], { unique: true })
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ default: 0 })
  capacity: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => InventoryItem, item => item.warehouse)
  inventoryItems: InventoryItem[];
}
