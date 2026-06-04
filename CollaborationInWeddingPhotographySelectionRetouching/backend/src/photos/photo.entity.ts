import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';
import { PhotoComment } from '../photo-comments/comment.entity';
import { RetouchTask } from '../retouch/retouch-task.entity';

export enum PhotoRating {
  UNRATED = 0,
  REJECT = 1,
  ALTERNATIVE = 3,
  MUST_SELECT = 5,
}

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'original_path', length: 255 })
  originalPath: string;

  @Column({ name: 'thumbnail_path', length: 255, nullable: true })
  thumbnailPath: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ name: 'is_selected', default: false })
  isSelected: boolean;

  @Column({
    type: 'tinyint',
    default: PhotoRating.UNRATED,
    comment: '0=unrated, 1=reject, 3=alternative, 5=must_select',
  })
  rating: PhotoRating;

  @Column({ name: 'uploaded_by', nullable: true })
  uploadedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Order, order => order.photos)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @OneToMany(() => PhotoComment, comment => comment.photo)
  comments: PhotoComment[];

  @OneToMany(() => RetouchTask, task => task.photo)
  retouchTasks: RetouchTask[];
}
