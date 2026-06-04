import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('flight')
export class Flight {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  flight_no: string;

  @Column({ length: 10 })
  departure_city: string;

  @Column({ length: 10 })
  arrival_city: string;

  @Column({ type: 'datetime' })
  scheduled_departure: Date;

  @Column({ type: 'datetime' })
  scheduled_arrival: Date;

  @Column({ length: 20, default: 'SCHEDULED' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
