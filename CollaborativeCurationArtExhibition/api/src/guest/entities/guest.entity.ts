import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Exhibition } from '../../exhibition/entities/exhibition.entity';

@Entity('guest')
export class Guest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'exhibition_id' })
  exhibitionId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: ['vvip', 'vip', 'media', 'general'], default: 'general' })
  category: 'vvip' | 'vip' | 'media' | 'general';

  @Column({ length: 30, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 200, nullable: true })
  organization: string;

  @Column({ type: 'enum', enum: ['pending', 'sent', 'accepted', 'declined'], default: 'pending', name: 'invite_status' })
  inviteStatus: 'pending' | 'sent' | 'accepted' | 'declined';

  @Column({ type: 'enum', enum: ['not_checked_in', 'checked_in'], default: 'not_checked_in', name: 'checkin_status' })
  checkinStatus: 'not_checked_in' | 'checked_in';

  @Column({ type: 'datetime', nullable: true, name: 'checkin_at' })
  checkinAt: Date;

  @Column({ type: 'enum', enum: ['qrcode', 'face', 'manual'], nullable: true, name: 'checkin_method' })
  checkinMethod: 'qrcode' | 'face' | 'manual';

  @Column({ type: 'text', nullable: true, name: 'face_embedding' })
  faceEmbedding: string;

  @Column({ length: 100, unique: true, nullable: true, name: 'qrcode_token' })
  qrcodeToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Exhibition, (exhibition) => exhibition.guests)
  @JoinColumn({ name: 'exhibition_id' })
  exhibition: Exhibition;
}
