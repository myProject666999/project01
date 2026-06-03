import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Mailing } from './mailing.entity';

@Entity('couriers')
export class Courier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 20, unique: true })
  code: string;

  @Column({ length: 255, nullable: true })
  api_url: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => Mailing, mailing => mailing.courier)
  mailings: Mailing[];
}
