import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Lesson } from './lesson.entity';
import { Teacher } from './teacher.entity';
import { Student } from './student.entity';

@Entity('lesson_evaluations')
export class LessonEvaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lesson_id', unique: true })
  lessonId: number;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'rhythm_score', nullable: true })
  rhythmScore: number;

  @Column({ name: 'rhythm_comment', type: 'text', nullable: true })
  rhythmComment: string;

  @Column({ name: 'intonation_score', nullable: true })
  intonationScore: number;

  @Column({ name: 'intonation_comment', type: 'text', nullable: true })
  intonationComment: string;

  @Column({ name: 'expression_score', nullable: true })
  expressionScore: number;

  @Column({ name: 'expression_comment', type: 'text', nullable: true })
  expressionComment: string;

  @Column({ name: 'accuracy_score', nullable: true })
  accuracyScore: number;

  @Column({ name: 'accuracy_comment', type: 'text', nullable: true })
  accuracyComment: string;

  @Column({ name: 'overall_comment', type: 'text', nullable: true })
  overallComment: string;

  @Column({ name: 'next_goal', type: 'text', nullable: true })
  nextGoal: string;

  @Column({ name: 'practice_assignments', type: 'text', nullable: true })
  practiceAssignments: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Lesson, (lesson) => lesson.evaluations)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => Teacher)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @ManyToOne(() => Student, (student) => student.evaluations)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
