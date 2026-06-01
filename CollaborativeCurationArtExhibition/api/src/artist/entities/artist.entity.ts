import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Exhibition } from '../../exhibition/entities/exhibition.entity';
import { Artwork } from '../../artwork/entities/artwork.entity';

@Entity('artist')
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'exhibition_id' })
  exhibitionId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 500, nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ type: 'enum', enum: ['pending', 'confirmed', 'withdrawn'], default: 'pending', name: 'confirm_status' })
  confirmStatus: 'pending' | 'confirmed' | 'withdrawn';

  @Column({ type: 'datetime', nullable: true, name: 'confirmed_at' })
  confirmedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Exhibition, (exhibition) => exhibition.artists)
  @JoinColumn({ name: 'exhibition_id' })
  exhibition: Exhibition;

  @OneToMany(() => Artwork, (artwork) => artwork.artist)
  artworks: Artwork[];
}
