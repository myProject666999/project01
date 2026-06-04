import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Photo } from '../photos/photo.entity';
import { User } from '../users/user.entity';
import { RetouchVersion } from './retouch-version.entity';

export enum RetouchTaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

@Entity('retouch_tasks')
export class RetouchTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'photo_id' })
  photoId: number;

  @Column({ name: 'retoucher_id', nullable: true })
  retoucherId: number;

  @Column({
    type: 'enum',
    enum: RetouchTaskStatus,
    default: RetouchTaskStatus.PENDING,
  })
  status: RetouchTaskStatus;

  @Column({ default: 1 })
  priority: number;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ name: 'current_version', default: 0 })
  currentVersion: number;

  @Column({ name: 'max_free_revisions', default: 3 })
  maxFreeRevisions: number;

  @Column({ name: 'paid_revisions', default: 0 })
  paidRevisions: number;

  @Column({ name: 'revision_fee', type: 'decimal', precision: 10, scale: 2, default: 50.00 })
  revisionFee: number;

  @Column({ name: 'assigned_at', nullable: true })
  assignedAt: Date;

  @Column({ name: 'submitted_at', nullable: true })
  submittedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Photo, photo => photo.retouchTasks)
  @JoinColumn({ name: 'photo_id' })
  photo: Photo;

  @ManyToOne(() => User, user => user.retouchTasks)
  @JoinColumn({ name: 'retoucher_id' })
  retoucher: User;

  @OneToMany(() => RetouchVersion, version => version.task)
  versions: RetouchVersion[];
}
