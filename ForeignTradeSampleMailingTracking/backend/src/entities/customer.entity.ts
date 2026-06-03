import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Mailing } from './mailing.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  crm_customer_id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, nullable: true })
  country: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => Mailing, mailing => mailing.customer)
  mailings: Mailing[];
}
