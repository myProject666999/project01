import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Wine } from './wine.entity';

@Entity('grape_variety')
export class GrapeVariety {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'percentage', type: 'int' })
  percentage: number;

  @ManyToOne(() => Wine, (wine) => wine.grapeVarieties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wine_id' })
  wine: Wine;

  @Column({ name: 'wine_id', type: 'int' })
  wineId: number;
}
