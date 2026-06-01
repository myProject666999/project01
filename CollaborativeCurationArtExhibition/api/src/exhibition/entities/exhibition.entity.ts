import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Artist } from '../../artist/entities/artist.entity';
import { Artwork } from '../../artwork/entities/artwork.entity';
import { Guest } from '../../guest/entities/guest.entity';
import { FloorPlan } from '../../floorplan/entities/floor-plan.entity';
import { MediaItem } from '../../media/entities/media-item.entity';

@Entity('exhibition')
export class Exhibition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200 })
  venue: string;

  @Column({ length: 500, nullable: true })
  address: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: string;

  @Column({ type: 'date', name: 'end_date' })
  endDate: string;

  @Column({ type: 'enum', enum: ['planning', 'preparing', 'installing', 'open', 'closed', 'dismantling'], default: 'planning' })
  status: 'planning' | 'preparing' | 'installing' | 'open' | 'closed' | 'dismantling';

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500, name: 'cover_image', nullable: true })
  coverImage: string;

  @Column({ name: 'curator_id' })
  curatorId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Artist, (artist) => artist.exhibition)
  artists: Artist[];

  @OneToMany(() => Artwork, (artwork) => artwork.exhibition)
  artworks: Artwork[];

  @OneToMany(() => Guest, (guest) => guest.exhibition)
  guests: Guest[];

  @OneToOne(() => FloorPlan, (floorPlan) => floorPlan.exhibition)
  floorPlan: FloorPlan;

  @OneToMany(() => MediaItem, (mediaItem) => mediaItem.exhibition)
  mediaItems: MediaItem[];
}
