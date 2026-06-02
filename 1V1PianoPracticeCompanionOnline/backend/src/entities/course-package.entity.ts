import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Teacher } from './teacher.entity';
import { UserCoursePackage } from './user-course-package.entity';

@Entity('course_packages')
export class CoursePackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  lessonCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Teacher, (teacher) => teacher.coursePackages)
  @JoinColumn()
  teacher: Teacher;

  @OneToMany(() => UserCoursePackage, (userCoursePackage) => userCoursePackage.coursePackage)
  userPackages: UserCoursePackage[];
}
