import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Member } from './member.entity';
import { StocktakingItem } from './stocktaking-item.entity';
import { StocktakingScopeType, StocktakingStatus } from './enums';

@Entity('stocktaking')
@Index(['taskNo'], { unique: true })
@Index(['scopeType', 'scopeId'])
@Index(['status'])
@Index(['createdBy'])
@Index(['createdAt'])
export class Stocktaking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'task_no', length: 50, unique: true })
  taskNo: string;

  @Column({ name: 'scope_type', type: 'enum', enum: StocktakingScopeType, default: StocktakingScopeType.ALL })
  scopeType: StocktakingScopeType;

  @Column({ name: 'scope_id', nullable: true })
  scopeId: number;

  @Column({ type: 'enum', enum: StocktakingStatus, default: StocktakingStatus.PENDING })
  status: StocktakingStatus;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number;

  @Column({ name: 'approved_at', type: 'datetime', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date;

  @ManyToOne(() => Member, member => member.createdStocktakings)
  @JoinColumn({ name: 'created_by' })
  createdByMember: Member;

  @ManyToOne(() => Member, member => member.approvedStocktakings)
  @JoinColumn({ name: 'approved_by' })
  approvedByMember: Member;

  @OneToMany(() => StocktakingItem, item => item.stocktaking)
  items: StocktakingItem[];
}
