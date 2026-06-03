import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Lesson } from './lesson.entity';
import { User } from './user.entity';

export enum AnnotationType {
  LINE = 'line',
  CIRCLE = 'circle',
  TEXT = 'text',
  FINGER_NUMBER = 'finger_number',
  HIGHLIGHT = 'highlight',
  ARROW = 'arrow',
}

@Entity('lesson_annotations')
export class LessonAnnotation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lesson_id' })
  lessonId: number;

  @Column({ name: 'created_by' })
  createdBy: number;

  @Column({ name: 'annotation_type', type: 'enum', enum: AnnotationType })
  annotationType: AnnotationType;

  @Column({ name: 'page_number', default: 1 })
  pageNumber: number;

  @Column({ name: 'position_x', type: 'decimal', precision: 10, scale: 4 })
  positionX: number;

  @Column({ name: 'position_y', type: 'decimal', precision: 10, scale: 4 })
  positionY: number;

  @Column({ name: 'end_position_x', type: 'decimal', precision: 10, scale: 4, nullable: true })
  endPositionX: number;

  @Column({ name: 'end_position_y', type: 'decimal', precision: 10, scale: 4, nullable: true })
  endPositionY: number;

  @Column({ default: '#FF0000' })
  color: string;

  @Column({ name: 'line_width', default: 2 })
  lineWidth: number;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'timestamp_seconds' })
  timestampSeconds: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Lesson, (lesson) => lesson.annotations)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
