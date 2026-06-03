import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, RelationId } from 'typeorm';
import { Wine } from './wine.entity';
import { Inventory } from './inventory.entity';

@Entity('tasting_note')
export class TastingNote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tasting_date', type: 'date' })
  tastingDate: string;

  @Column({ name: 'companions', type: 'varchar', length: 500, nullable: true })
  companions: string;

  @Column({ name: 'appearance_score', type: 'int' })
  appearanceScore: number;

  @Column({ name: 'aroma_score', type: 'int' })
  aromaScore: number;

  @Column({ name: 'taste_score', type: 'int' })
  tasteScore: number;

  @Column({ name: 'overall_score', type: 'int' })
  overallScore: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Wine, (wine) => wine.tastingNotes)
  @JoinColumn({ name: 'wine_id' })
  wine: Wine;

  @RelationId((tn: TastingNote) => tn.wine)
  wineId: number;

  @ManyToOne(() => Inventory, (inv) => inv.tastingNote)
  @JoinColumn({ name: 'inventory_id' })
  inventory: Inventory;

  @RelationId((tn: TastingNote) => tn.inventory)
  inventoryId: number;
}
