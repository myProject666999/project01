import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RetouchTask } from './retouch-task.entity';

export enum RetouchVersionStatus {
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('retouch_versions')
export class RetouchVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_id' })
  taskId: number;

  @Column()
  version: number;

  @Column({ name: 'file_path', length: 255 })
  filePath: string;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'is_watermarked', default: false })
  isWatermarked: boolean;

  @Column({ name: 'retoucher_note', type: 'text', nullable: true })
  retoucherNote: string;

  @Column({ name: 'client_feedback', type: 'text', nullable: true })
  clientFeedback: string;

  @Column({
    type: 'enum',
    enum: RetouchVersionStatus,
    default: RetouchVersionStatus.SUBMITTED,
  })
  status: RetouchVersionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => RetouchTask, task => task.versions)
  @JoinColumn({ name: 'task_id' })
  task: RetouchTask;
}
