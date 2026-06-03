import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Voyage } from './voyage.entity';
import { Supply } from './supply.entity';
import { Warehouse } from './warehouse.entity';
import { VoyageSupplyStatus } from './enums';

@Entity('voyage_supply')
@Index(['voyageId', 'supplyId', 'targetWarehouseId'], { unique: true })
@Index(['voyageId'])
@Index(['supplyId'])
@Index(['status'])
export class VoyageSupply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'voyage_id' })
  voyageId: number;

  @Column({ name: 'supply_id' })
  supplyId: number;

  @Column({ name: 'target_warehouse_id' })
  targetWarehouseId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ name: 'actual_quantity', type: 'decimal', precision: 12, scale: 2, nullable: true })
  actualQuantity: number;

  @Column({ type: 'enum', enum: VoyageSupplyStatus, default: VoyageSupplyStatus.PENDING })
  status: VoyageSupplyStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Voyage, voyage => voyage.voyageSupplies)
  @JoinColumn({ name: 'voyage_id' })
  voyage: Voyage;

  @ManyToOne(() => Supply, supply => supply.voyageSupplies)
  @JoinColumn({ name: 'supply_id' })
  supply: Supply;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'target_warehouse_id' })
  targetWarehouse: Warehouse;
}
