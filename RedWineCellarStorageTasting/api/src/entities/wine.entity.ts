import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GrapeVariety } from './grape-variety.entity';
import { Inventory } from './inventory.entity';
import { TastingNote } from './tasting-note.entity';

@Entity('wine')
export class Wine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'region', type: 'varchar', length: 255 })
  region: string;

  @Column({ name: 'chateau', type: 'varchar', length: 255 })
  chateau: string;

  @Column({ name: 'vintage', type: 'int' })
  vintage: number;

  @Column({ name: 'abv', type: 'decimal', precision: 4, scale: 2 })
  abv: number;

  @Column({ name: 'drink_from', type: 'int' })
  drinkFrom: number;

  @Column({ name: 'drink_to', type: 'int' })
  drinkTo: number;

  @Column({ name: 'purchase_price', type: 'decimal', precision: 10, scale: 2 })
  purchasePrice: number;

  @Column({ name: 'market_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  marketPrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => GrapeVariety, (gv) => gv.wine, { cascade: true })
  grapeVarieties: GrapeVariety[];

  @OneToMany(() => Inventory, (inv) => inv.wine)
  inventories: Inventory[];

  @OneToMany(() => TastingNote, (tn) => tn.wine)
  tastingNotes: TastingNote[];
}
