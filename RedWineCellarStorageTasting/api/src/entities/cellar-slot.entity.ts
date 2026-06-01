import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Inventory } from './inventory.entity';

export enum SlotStatus {
  EMPTY = 'empty',
  OCCUPIED = 'occupied',
}

@Entity('cellar_slot')
export class CellarSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'rack_no', type: 'int' })
  rackNo: number;

  @Column({ name: 'layer_no', type: 'int' })
  layerNo: number;

  @Column({ name: 'position_no', type: 'int' })
  positionNo: number;

  @Column({ name: 'status', type: 'enum', enum: SlotStatus, default: SlotStatus.EMPTY })
  status: SlotStatus;

  @OneToOne(() => Inventory, (inv) => inv.slot)
  inventory: Inventory;
}
