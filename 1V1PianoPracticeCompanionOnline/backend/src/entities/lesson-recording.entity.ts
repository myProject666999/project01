import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Lesson } from './lesson.entity';
import { User } from './user.entity';

export enum RecordingType {
  AUDIO = 'audio',
  VIDEO = 'video',
  SCREEN = 'screen',
}

@Entity('lesson_recordings')
export class LessonRecording {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  fileUrl: string;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({
    type: 'enum',
    enum: RecordingType,
    default: RecordingType.AUDIO,
  })
  type: RecordingType;

  @ManyToOne(() => Lesson, (lesson) => lesson.recordings)
  @JoinColumn()
  lesson: Lesson;

  @ManyToOne(() => User)
  @JoinColumn()
  uploadedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
