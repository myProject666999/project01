import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Photo } from '../photos/photo.entity';
import { User } from '../users/user.entity';

@Entity('photo_comments')
export class PhotoComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'photo_id' })
  photoId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Photo, photo => photo.comments)
  @JoinColumn({ name: 'photo_id' })
  photo: Photo;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
