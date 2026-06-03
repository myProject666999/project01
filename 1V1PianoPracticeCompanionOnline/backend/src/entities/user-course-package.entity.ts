import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Student } from './student.entity';
import { CoursePackage } from './course-package.entity';

export enum PackageStatus {
  ACTIVE = 'active',
  USED_UP = 'used_up',
  EXPIRED = 'expired',
}

@Entity('user_course_packages')
export class UserCoursePackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'course_package_id' })
  coursePackageId: number;

  @Column({ name: 'remaining_lessons' })
  remainingLessons: number;

  @Column({ name: 'total_lessons' })
  totalLessons: number;

  @Column({ name: 'purchase_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  purchaseDate: Date;

  @Column({ name: 'expire_date', type: 'timestamp', nullable: true })
  expireDate: Date;

  @Column({ type: 'enum', enum: PackageStatus, default: PackageStatus.ACTIVE })
  status: PackageStatus;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountPaid: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Student, (student) => student.coursePackages)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => CoursePackage, (cp) => cp.userPackages)
  @JoinColumn({ name: 'course_package_id' })
  coursePackage: CoursePackage;
}
