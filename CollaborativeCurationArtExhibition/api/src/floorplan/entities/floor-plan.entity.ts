import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Exhibition } from '../../exhibition/entities/exhibition.entity';

@Entity('floor_plan')
export class FloorPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'exhibition_id' })
  exhibitionId: number;

  @Column({ length: 500, nullable: true, name: 'background_url' })
  backgroundUrl: string;

  @Column({ type: 'int', default: 1200 })
  width: number;

  @Column({ type: 'int', default: 800 })
  height: number;

  @Column({ type: 'json', name: 'layout_data', nullable: true })
  layoutData: object;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Exhibition, (exhibition) => exhibition.floorPlan)
  @JoinColumn({ name: 'exhibition_id' })
  exhibition: Exhibition;
}
