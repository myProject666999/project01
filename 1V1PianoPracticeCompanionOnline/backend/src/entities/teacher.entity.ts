import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { TeacherSkill } from './teacher-skill.entity';
import { Booking } from './booking.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @Column({ name: 'teaching_years', default: 0 })
  teachingYears: number;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  certifications: string;

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column({ name: 'total_lessons', default: 0 })
  totalLessons: number;

  @Column({ name: 'chinese_teaching', default: false })
  chineseTeaching: boolean;

  @Column({ name: 'video_intro_url', nullable: true })
  videoIntroUrl: string;

  @Column({ name: 'available_times', type: 'json', nullable: true })
  availableTimes: object;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => TeacherSkill, (skill) => skill.teacher)
  skills: TeacherSkill[];

  @OneToMany(() => Booking, (booking) => booking.teacher)
  bookings: Booking[];
}
