import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { UserCoursePackage } from './user-course-package.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @ManyToOne(() => Student, (student) => student.bookings)
  @JoinColumn()
  student: Student;

  @ManyToOne(() => Teacher, (teacher) => teacher.bookings)
  @JoinColumn()
  teacher: Teacher;

  @ManyToOne(() => UserCoursePackage, { nullable: true })
  @JoinColumn()
  coursePackage: UserCoursePackage;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
