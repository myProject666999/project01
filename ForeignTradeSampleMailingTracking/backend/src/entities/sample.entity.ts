import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Mailing } from './mailing.entity';

@Entity('samples')
export class Sample {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  model: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_cost: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  weight: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => Mailing, mailing => mailing.sample)
  mailings: Mailing[];
}
