import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Teacher } from './teacher.entity';

@Entity('teacher_skills')
export class TeacherSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'int', default: 1 })
  proficiency: number;

  @ManyToOne(() => Teacher, (teacher) => teacher.skills)
  @JoinColumn()
  teacher: Teacher;
}
