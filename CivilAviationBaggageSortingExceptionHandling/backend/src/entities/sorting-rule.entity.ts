import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SortingPort } from './sorting-port.entity';

@Entity('sorting_rule')
export class SortingRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  flight_no: string;

  @Column()
  port_id: number;

  @Column({ type: 'datetime' })
  effective_start: Date;

  @Column({ type: 'datetime' })
  effective_end: Date;

  @Column({ default: 0 })
  priority: number;

  @ManyToOne(() => SortingPort, port => port.rules)
  @JoinColumn({ name: 'port_id' })
  sorting_port: SortingPort;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
