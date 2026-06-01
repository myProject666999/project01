import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Artist } from '../../artist/entities/artist.entity';
import { Exhibition } from '../../exhibition/entities/exhibition.entity';

@Entity('artist_replacement')
export class ArtistReplacement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'exhibition_id' })
  exhibitionId: number;

  @Column({ name: 'original_artist_id' })
  originalArtistId: number;

  @Column({ name: 'replacement_artist_id', nullable: true })
  replacementArtistId: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'completed', 'rejected'],
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'completed' | 'rejected';

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Artist)
  @JoinColumn({ name: 'original_artist_id' })
  originalArtist: Artist;

  @ManyToOne(() => Artist)
  @JoinColumn({ name: 'replacement_artist_id' })
  replacementArtist: Artist;

  @ManyToOne(() => Exhibition)
  @JoinColumn({ name: 'exhibition_id' })
  exhibition: Exhibition;
}
