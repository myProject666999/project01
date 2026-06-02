import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Lesson } from './lesson.entity';
import { User } from './user.entity';

export enum AnnotationType {
  COMMENT = 'comment',
  HIGHLIGHT = 'highlight',
  CORRECTION = 'correction',
  PRAISE = 'praise',
}

@Entity('lesson_annotations')
export class LessonAnnotation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: AnnotationType,
    default: AnnotationType.COMMENT,
  })
  type: AnnotationType;

  @Column({ nullable: true })
  measure: number;

  @Column({ nullable: true })
  timestamp: number;

  @ManyToOne(() => Lesson, (lesson) => lesson.annotations)
  @JoinColumn()
  lesson: Lesson;

  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
