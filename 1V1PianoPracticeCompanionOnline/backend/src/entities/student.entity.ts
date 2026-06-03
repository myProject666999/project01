import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Booking } from './booking.entity';
import { UserCoursePackage } from './user-course-package.entity';
import { LessonEvaluation } from './lesson-evaluation.entity';

export enum StudentLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number;

  @Column({ nullable: true })
  age: number;

  @Column({ type: 'enum', enum: StudentLevel, default: StudentLevel.BEGINNER })
  level: StudentLevel;

  @Column({ name: 'current_book', nullable: true })
  currentBook: string;

  @Column({ name: 'learning_goals', type: 'text', nullable: true })
  learningGoals: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'parent_id' })
  parent: User;

  @OneToMany(() => Booking, (booking) => booking.student)
  bookings: Booking[];

  @OneToMany(() => UserCoursePackage, (ucp) => ucp.student)
  coursePackages: UserCoursePackage[];

  @OneToMany(() => LessonEvaluation, (evaluation) => evaluation.student)
  evaluations: LessonEvaluation[];
}
