import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { UserCoursePackage } from './user-course-package.entity';
import { SheetMusic } from './sheet-music.entity';
import { User } from './user.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @Column({ name: 'user_course_package_id' })
  userCoursePackageId: number;

  @Column({ name: 'sheet_music_id', nullable: true })
  sheetMusicId: number;

  @Column({ name: 'scheduled_start', type: 'datetime' })
  scheduledStart: Date;

  @Column({ name: 'scheduled_end', type: 'datetime' })
  scheduledEnd: Date;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ name: 'cancellation_reason', nullable: true })
  cancellationReason: string;

  @Column({ name: 'cancelled_by', nullable: true })
  cancelledBy: number;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Student, (student) => student.bookings)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Teacher, (teacher) => teacher.bookings)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @ManyToOne(() => UserCoursePackage)
  @JoinColumn({ name: 'user_course_package_id' })
  coursePackage: UserCoursePackage;

  @ManyToOne(() => SheetMusic)
  @JoinColumn({ name: 'sheet_music_id' })
  sheetMusic: SheetMusic;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cancelled_by' })
  canceller: User;
}
