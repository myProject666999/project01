import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Booking } from './booking.entity';
import { SheetMusic } from './sheet-music.entity';
import { LessonAnnotation } from './lesson-annotation.entity';
import { LessonEvaluation } from './lesson-evaluation.entity';
import { LessonRecording } from './lesson-recording.entity';

export enum LessonStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  lessonPlan: string;

  @Column({
    type: 'enum',
    enum: LessonStatus,
    default: LessonStatus.NOT_STARTED,
  })
  status: LessonStatus;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({ type: 'datetime', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'datetime', nullable: true })
  actualEndTime: Date;

  @OneToOne(() => Booking)
  @JoinColumn()
  booking: Booking;

  @ManyToOne(() => SheetMusic, (sheetMusic) => sheetMusic.lessons, { nullable: true })
  @JoinColumn()
  sheetMusic: SheetMusic;

  @OneToMany(() => LessonAnnotation, (annotation) => annotation.lesson)
  annotations: LessonAnnotation[];

  @OneToMany(() => LessonEvaluation, (evaluation) => evaluation.lesson)
  evaluations: LessonEvaluation[];

  @OneToMany(() => LessonRecording, (recording) => recording.lesson)
  recordings: LessonRecording[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
