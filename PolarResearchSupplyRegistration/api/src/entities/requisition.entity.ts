import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Member } from './member.entity';
import { Project } from './project.entity';
import { RequisitionItem } from './requisition-item.entity';
import { PurposeType, RequisitionStatus } from './enums';

@Entity('requisition')
@Index(['reqNo'], { unique: true })
@Index(['memberId'])
@Index(['projectId'])
@Index(['status'])
@Index(['createdAt'])
export class Requisition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'req_no', length: 50, unique: true })
  reqNo: string;

  @Column({ name: 'member_id' })
  memberId: number;

  @Column({ name: 'project_id', nullable: true })
  projectId: number;

  @Column({ name: 'purpose_type', type: 'enum', enum: PurposeType, default: PurposeType.PERSONAL })
  purposeType: PurposeType;

  @Column({ type: 'enum', enum: RequisitionStatus, default: RequisitionStatus.PENDING })
  status: RequisitionStatus;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number;

  @Column({ name: 'approved_at', type: 'datetime', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Member, member => member.requisitions)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Project, project => project.requisitions)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'approved_by' })
  approver: Member;

  @OneToMany(() => RequisitionItem, item => item.requisition)
  items: RequisitionItem[];
}
