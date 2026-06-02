import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Lesson } from './lesson.entity';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';

export enum EvaluationFrom {
  STUDENT = 'student',
  TEACHER = 'teacher',
}

@Entity('lesson_evaluations')
export class LessonEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unsigned: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({
    type: 'enum',
    enum: EvaluationFrom,
  })
  from: EvaluationFrom;

  @ManyToOne(() => Lesson, (lesson) => lesson.evaluations)
  @JoinColumn()
  lesson: Lesson;

  @ManyToOne(() => Student, (student) => student.evaluations, { nullable: true })
  @JoinColumn()
  student: Student;

  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn()
  teacher: Teacher;

  @CreateDateColumn()
  createdAt: Date;
}
