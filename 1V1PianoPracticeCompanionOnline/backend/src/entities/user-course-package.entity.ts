import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Student } from './student.entity';
import { CoursePackage } from './course-package.entity';

export enum PackageStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

@Entity('user_course_packages')
export class UserCoursePackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  usedLessons: number;

  @Column({
    type: 'enum',
    enum: PackageStatus,
    default: PackageStatus.ACTIVE,
  })
  status: PackageStatus;

  @Column({ nullable: true })
  expiredAt: Date;

  @ManyToOne(() => Student, (student) => student.coursePackages)
  @JoinColumn()
  student: Student;

  @ManyToOne(() => CoursePackage, (coursePackage) => coursePackage.userPackages)
  @JoinColumn()
  coursePackage: CoursePackage;

  @CreateDateColumn()
  purchasedAt: Date;
}
