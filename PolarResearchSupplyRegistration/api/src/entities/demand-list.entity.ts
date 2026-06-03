import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Voyage } from './voyage.entity';
import { DemandListItem } from './demand-list-item.entity';
import { DemandListStatus } from './enums';

@Entity('demand_list')
@Index(['voyageId'])
@Index(['status'])
@Index(['createdAt'])
export class DemandList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ name: 'voyage_id', nullable: true })
  voyageId: number;

  @Column({ type: 'enum', enum: DemandListStatus, default: DemandListStatus.DRAFT })
  status: DemandListStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Voyage)
  @JoinColumn({ name: 'voyage_id' })
  voyage: Voyage;

  @OneToMany(() => DemandListItem, item => item.demandList)
  items: DemandListItem[];
}
