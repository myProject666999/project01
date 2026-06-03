import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { VoyageSupply } from './voyage-supply.entity';
import { VoyageStatus } from './enums';

@Entity('voyage')
@Index(['voyageNo'], { unique: true })
@Index(['status'])
@Index(['arrivalDate'])
export class Voyage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'voyage_no', length: 50, unique: true })
  voyageNo: string;

  @Column({ name: 'ship_name', length: 100, nullable: true })
  shipName: string;

  @Column({ name: 'arrival_date', type: 'date' })
  arrivalDate: string;

  @Column({ type: 'enum', enum: VoyageStatus, default: VoyageStatus.PLANNED })
  status: VoyageStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => VoyageSupply, vs => vs.voyage)
  voyageSupplies: VoyageSupply[];
}
