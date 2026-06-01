import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Exhibition } from '../../exhibition/entities/exhibition.entity';
import { Artist } from '../../artist/entities/artist.entity';
import { ArtworkStatusLog } from './artwork-status-log.entity';

@Entity('artwork')
export class Artwork {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'exhibition_id' })
  exhibitionId: number;

  @Column({ name: 'artist_id' })
  artistId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 500, nullable: true })
  image: string;

  @Column({ length: 200, nullable: true })
  medium: string;

  @Column({ length: 100, nullable: true })
  dimensions: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ type: 'enum', enum: ['shipped', 'in_transit', 'arrived', 'unpacked', 'hung', 'dismantled', 'returned'], default: 'shipped', name: 'transport_status' })
  transportStatus: 'shipped' | 'in_transit' | 'arrived' | 'unpacked' | 'hung' | 'dismantled' | 'returned';

  @Column({ type: 'float', default: 0, name: 'position_x' })
  positionX: number;

  @Column({ type: 'float', default: 0, name: 'position_y' })
  positionY: number;

  @Column({ type: 'float', default: 0 })
  rotation: number;

  @Column({ length: 500, nullable: true, name: 'wall_label' })
  wallLabel: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Exhibition, (exhibition) => exhibition.artworks)
  @JoinColumn({ name: 'exhibition_id' })
  exhibition: Exhibition;

  @ManyToOne(() => Artist, (artist) => artist.artworks)
  @JoinColumn({ name: 'artist_id' })
  artist: Artist;

  @OneToMany(() => ArtworkStatusLog, (log) => log.artwork)
  statusLogs: ArtworkStatusLog[];
}
