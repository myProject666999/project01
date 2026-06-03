import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { DemandList } from './demand-list.entity';
import { Supply } from './supply.entity';

@Entity('demand_list_item')
@Index(['demandListId', 'supplyId'], { unique: true })
@Index(['demandListId'])
@Index(['supplyId'])
export class DemandListItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'demand_list_id' })
  demandListId: number;

  @Column({ name: 'supply_id' })
  supplyId: number;

  @Column({ name: 'required_quantity', type: 'decimal', precision: 12, scale: 2 })
  requiredQuantity: number;

  @Column({ name: 'suggested_quantity', type: 'decimal', precision: 12, scale: 2 })
  suggestedQuantity: number;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => DemandList, demandList => demandList.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'demand_list_id' })
  demandList: DemandList;

  @ManyToOne(() => Supply, supply => supply.demandListItems)
  @JoinColumn({ name: 'supply_id' })
  supply: Supply;
}
