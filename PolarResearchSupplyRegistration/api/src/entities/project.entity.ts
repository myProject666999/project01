import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { Member } from './member.entity';
import { Requisition } from './requisition.entity';
import { ProjectStatus } from './enums';

@Entity('project')
@Index(['name'], { unique: true })
@Index(['status'])
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 100, nullable: true })
  leader: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.ACTIVE })
  status: ProjectStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Member, member => member.project)
  members: Member[];

  @OneToMany(() => Requisition, requisition => requisition.project)
  requisitions: Requisition[];
}
