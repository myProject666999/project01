import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MediaItem } from './media-item.entity';

@Entity('media_version')
export class MediaVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'media_item_id' })
  mediaItemId: number;

  @Column({ type: 'int', name: 'version_number' })
  versionNumber: number;

  @Column({ length: 500, name: 'file_url' })
  fileUrl: string;

  @Column({ length: 200, name: 'file_name' })
  fileName: string;

  @Column({ type: 'int', nullable: true, name: 'file_size' })
  fileSize: number;

  @Column({ length: 100, nullable: true, name: 'uploaded_by' })
  uploadedBy: string;

  @Column({ type: 'text', nullable: true, name: 'change_log' })
  changeLog: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => MediaItem, (mediaItem) => mediaItem.versions)
  @JoinColumn({ name: 'media_item_id' })
  mediaItem: MediaItem;
}
