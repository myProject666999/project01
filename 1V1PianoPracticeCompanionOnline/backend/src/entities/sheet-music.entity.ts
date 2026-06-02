import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Lesson } from './lesson.entity';

@Entity('sheet_music')
export class SheetMusic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  artist: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  fileUrl: string;

  @Column({ nullable: true })
  difficulty: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: true })
  isPublic: boolean;

  @ManyToOne(() => User)
  @JoinColumn()
  uploadedBy: User;

  @OneToMany(() => Lesson, (lesson) => lesson.sheetMusic)
  lessons: Lesson[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
