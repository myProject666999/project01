import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Booking } from './booking.entity';
import { UserCoursePackage } from './user-course-package.entity';
import { LessonEvaluation } from './lesson-evaluation.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  realName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  level: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @OneToOne(() => User, (user) => user.student)
  @JoinColumn()
  user: User;

  @OneToMany(() => Booking, (booking) => booking.student)
  bookings: Booking[];

  @OneToMany(() => UserCoursePackage, (userCoursePackage) => userCoursePackage.student)
  coursePackages: UserCoursePackage[];

  @OneToMany(() => LessonEvaluation, (evaluation) => evaluation.student)
  evaluations: LessonEvaluation[];
}
