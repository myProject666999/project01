import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserCoursePackage } from './user-course-package.entity';

export enum CourseLevel {
  ALL = 'all',
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('course_packages')
export class CoursePackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'total_lessons' })
  totalLessons: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'lesson_duration' })
  lessonDuration: number;

  @Column({ type: 'enum', enum: CourseLevel, default: CourseLevel.ALL })
  level: CourseLevel;

  @Column({ name: 'valid_days', default: 365 })
  validDays: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserCoursePackage, (ucp) => ucp.coursePackage)
  userPackages: UserCoursePackage[];
}
