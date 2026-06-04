import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { SortingRule } from './sorting-rule.entity';

@Entity('sorting_port')
export class SortingPort {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, unique: true })
  port_code: string;

  @Column({ length: 50 })
  port_name: string;

  @Column({ length: 20, default: 'ACTIVE' })
  status: string;

  @OneToMany(() => SortingRule, rule => rule.sorting_port)
  rules: SortingRule[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
