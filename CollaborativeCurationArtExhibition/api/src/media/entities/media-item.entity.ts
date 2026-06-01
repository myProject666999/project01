import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Exhibition } from '../../exhibition/entities/exhibition.entity';
import { MediaVersion } from './media-version.entity';

@Entity('media_item')
export class MediaItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'exhibition_id' })
  exhibitionId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'enum', enum: ['poster', 'press_release', 'other'], default: 'other' })
  type: 'poster' | 'press_release' | 'other';

  @Column({ name: 'current_version', default: 0 })
  currentVersion: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Exhibition, (exhibition) => exhibition.mediaItems)
  @JoinColumn({ name: 'exhibition_id' })
  exhibition: Exhibition;

  @OneToMany(() => MediaVersion, (version) => version.mediaItem)
  versions: MediaVersion[];
}
