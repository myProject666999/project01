import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Passenger } from './passenger.entity';
import { Flight } from './flight.entity';
import { BaggageScanLog } from './baggage-scan-log.entity';

@Entity('baggage')
export class Baggage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10, unique: true })
  tag_code: string;

  @Column()
  passenger_id: number;

  @Column()
  flight_id: number;

  @Column({ length: 20, default: 'CHECKED_IN' })
  status: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  weight: number;

  @ManyToOne(() => Passenger)
  @JoinColumn({ name: 'passenger_id' })
  passenger: Passenger;

  @ManyToOne(() => Flight)
  @JoinColumn({ name: 'flight_id' })
  flight: Flight;

  @OneToMany(() => BaggageScanLog, log => log.baggage)
  scan_logs: BaggageScanLog[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
