import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { Wine } from './wine.entity';
import { CellarSlot } from './cellar-slot.entity';
import { TastingNote } from './tasting-note.entity';

export enum InventoryStatus {
  IN_CELLAR = 'in_cellar',
  OPENED = 'opened',
}

@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'status', type: 'enum', enum: InventoryStatus, default: InventoryStatus.IN_CELLAR })
  status: InventoryStatus;

  @Column({ name: 'stock_in_date', type: 'date' })
  stockInDate: string;

  @Column({ name: 'opened_date', type: 'date', nullable: true })
  openedDate: string;

  @ManyToOne(() => Wine, (wine) => wine.inventories)
  @JoinColumn({ name: 'wine_id' })
  wine: Wine;

  @RelationId((inv: Inventory) => inv.wine)
  wineId: number;

  @OneToOne(() => CellarSlot, (slot) => slot.inventory)
  @JoinColumn({ name: 'slot_id' })
  slot: CellarSlot;

  @RelationId((inv: Inventory) => inv.slot)
  slotId: number;

  @OneToOne(() => TastingNote, (tn) => tn.inventory)
  tastingNote: TastingNote;
}
