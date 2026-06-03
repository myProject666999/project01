import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Project } from './project.entity';
import { Requisition } from './requisition.entity';
import { Stocktaking } from './stocktaking.entity';
import { MemberRole } from './enums';

@Entity('member')
@Index(['name'])
@Index(['role'])
@Index(['projectId'])
export class Member {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: MemberRole, default: MemberRole.RESEARCHER })
  role: MemberRole;

  @Column({ length: 100, nullable: true })
  team: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Project, project => project.members)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => Requisition, requisition => requisition.member)
  requisitions: Requisition[];

  @OneToMany(() => Stocktaking, stocktaking => stocktaking.createdByMember)
  createdStocktakings: Stocktaking[];

  @OneToMany(() => Stocktaking, stocktaking => stocktaking.approvedByMember)
  approvedStocktakings: Stocktaking[];
}
