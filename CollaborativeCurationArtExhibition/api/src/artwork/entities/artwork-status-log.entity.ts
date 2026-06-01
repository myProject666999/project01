import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Artwork } from './artwork.entity';

@Entity('artwork_status_log')
export class ArtworkStatusLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'artwork_id' })
  artworkId: number;

  @Column({ length: 50, nullable: true, name: 'from_status' })
  fromStatus: string;

  @Column({ length: 50, name: 'to_status' })
  toStatus: string;

  @Column({ length: 100, nullable: true })
  operator: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Artwork, (artwork) => artwork.statusLogs)
  @JoinColumn({ name: 'artwork_id' })
  artwork: Artwork;
}
