import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Lesson } from './lesson.entity';

export enum RecordingType {
  TEACHER = 'teacher',
  STUDENT = 'student',
  COMBINED = 'combined',
}

@Entity('lesson_recordings')
export class LessonRecording {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lesson_id' })
  lessonId: number;

  @Column({ name: 'recording_type', type: 'enum', enum: RecordingType })
  recordingType: RecordingType;

  @Column({ name: 'video_url' })
  videoUrl: string;

  @Column({ name: 'duration_seconds', nullable: true })
  durationSeconds: number;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ name: 'annotation_sync_data', type: 'json', nullable: true })
  annotationSyncData: object;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Lesson, (lesson) => lesson.recordings)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;
}
