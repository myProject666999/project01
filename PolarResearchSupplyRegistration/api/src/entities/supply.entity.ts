import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Category } from './category.entity';
import { InventoryItem } from './inventory-item.entity';
import { VoyageSupply } from './voyage-supply.entity';
import { RequisitionItem } from './requisition-item.entity';
import { DemandListItem } from './demand-list-item.entity';
import { Alert } from './alert.entity';

@Entity('supply')
@Index(['categoryId'])
@Index(['name'])
export class Supply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ length: 20 })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  calories: number;

  @Column({ name: 'shelf_life_days', nullable: true })
  shelfLifeDays: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category, category => category.supplies)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => InventoryItem, item => item.supply)
  inventoryItems: InventoryItem[];

  @OneToMany(() => VoyageSupply, vs => vs.supply)
  voyageSupplies: VoyageSupply[];

  @OneToMany(() => RequisitionItem, ri => ri.supply)
  requisitionItems: RequisitionItem[];

  @OneToMany(() => DemandListItem, dli => dli.supply)
  demandListItems: DemandListItem[];

  @OneToMany(() => Alert, alert => alert.supply)
  alerts: Alert[];
}
