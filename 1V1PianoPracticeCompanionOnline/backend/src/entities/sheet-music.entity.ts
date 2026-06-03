import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';
import { DifficultyLevel } from './teacher-skill.entity';

export enum SheetMusicFileType {
  PDF = 'pdf',
  IMAGE = 'image',
}

@Entity('sheet_music')
export class SheetMusic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  composer: string;

  @Column({ name: 'difficulty_level', type: 'enum', enum: DifficultyLevel, nullable: true })
  difficultyLevel: DifficultyLevel;

  @Column({ name: 'file_type', type: 'enum', enum: SheetMusicFileType })
  fileType: SheetMusicFileType;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'page_count', default: 1 })
  pageCount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  uploader: User;

  @OneToMany(() => Lesson, (lesson) => lesson.sheetMusic)
  lessons: Lesson[];
}
