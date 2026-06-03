import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Booking } from './booking.entity';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { SheetMusic } from './sheet-music.entity';
import { LessonAnnotation } from './lesson-annotation.entity';
import { LessonEvaluation } from './lesson-evaluation.entity';
import { LessonRecording } from './lesson-recording.entity';

export enum LessonStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  INTERRUPTED = 'interrupted',
}

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'booking_id', unique: true })
  bookingId: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @Column({ name: 'sheet_music_id', nullable: true })
  sheetMusicId: number;

  @Column({ name: 'actual_start', type: 'datetime', nullable: true })
  actualStart: Date;

  @Column({ name: 'actual_end', type: 'datetime', nullable: true })
  actualEnd: Date;

  @Column({ type: 'enum', enum: LessonStatus, default: LessonStatus.NOT_STARTED })
  status: LessonStatus;

  @Column({ name: 'room_id', nullable: true })
  roomId: string;

  @Column({ name: 'teacher_video_url', nullable: true })
  teacherVideoUrl: string;

  @Column({ name: 'student_video_url', nullable: true })
  studentVideoUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @ManyToOne(() => SheetMusic, (sm) => sm.lessons)
  @JoinColumn({ name: 'sheet_music_id' })
  sheetMusic: SheetMusic;

  @OneToMany(() => LessonAnnotation, (annotation) => annotation.lesson)
  annotations: LessonAnnotation[];

  @OneToMany(() => LessonEvaluation, (evaluation) => evaluation.lesson)
  evaluations: LessonEvaluation[];

  @OneToMany(() => LessonRecording, (recording) => recording.lesson)
  recordings: LessonRecording[];
}
