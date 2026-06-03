import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Supply } from './supply.entity';
import { AlertLevel } from './enums';

@Entity('alert')
@Index(['supplyId'])
@Index(['level'])
@Index(['resolved'])
@Index(['createdAt'])
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'supply_id' })
  supplyId: number;

  @Column({ name: 'daily_consumption', type: 'decimal', precision: 10, scale: 4, default: 0 })
  dailyConsumption: number;

  @Column({ name: 'days_remaining', type: 'decimal', precision: 10, scale: 2, nullable: true })
  daysRemaining: number;

  @Column({ type: 'enum', enum: AlertLevel, default: AlertLevel.NOTICE })
  level: AlertLevel;

  @Column({ default: false })
  resolved: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Supply, supply => supply.alerts)
  @JoinColumn({ name: 'supply_id' })
  supply: Supply;
}
