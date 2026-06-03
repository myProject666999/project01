import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Teacher } from './teacher.entity';

export enum DifficultyLevel {
  BAYER = '拜厄',
  CZERNY_599 = '车尔尼599',
  CZERNY_849 = '车尔尼849',
  CZERNY_299 = '车尔尼299',
  CZERNY_740 = '车尔尼740',
  BACH_BEGINNER = '巴赫初级',
  BACH_INTERMEDIATE = '巴赫中级',
  BACH_ADVANCED = '巴赫高级',
  MOZART_SONATA = '莫扎特奏鸣曲',
  BEETHOVEN_SONATA = '贝多芬奏鸣曲',
  CHOPIN_ETUDE = '肖邦练习曲',
  LISZT_ETUDE = '李斯特练习曲',
}

export enum ProficiencyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Entity('teacher_skills')
export class TeacherSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'teacher_id' })
  teacherId: number;

  @Column({ name: 'difficulty_level', type: 'enum', enum: DifficultyLevel })
  difficultyLevel: DifficultyLevel;

  @Column({ name: 'proficiency_level', type: 'enum', enum: ProficiencyLevel, default: ProficiencyLevel.INTERMEDIATE })
  proficiencyLevel: ProficiencyLevel;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Teacher, (teacher) => teacher.skills)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
}
