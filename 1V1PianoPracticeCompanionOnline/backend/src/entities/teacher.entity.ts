import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { TeacherSkill } from './teacher-skill.entity';
import { Booking } from './booking.entity';
import { CoursePackage } from './course-package.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  realName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column({ default: 0 })
  lessonCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pricePerHour: number;

  @OneToOne(() => User, (user) => user.teacher)
  @JoinColumn()
  user: User;

  @OneToMany(() => TeacherSkill, (skill) => skill.teacher)
  skills: TeacherSkill[];

  @OneToMany(() => Booking, (booking) => booking.teacher)
  bookings: Booking[];

  @OneToMany(() => CoursePackage, (coursePackage) => coursePackage.teacher)
  coursePackages: CoursePackage[];
}
