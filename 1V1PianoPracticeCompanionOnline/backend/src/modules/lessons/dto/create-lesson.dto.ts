import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { LessonStatus } from '../../../entities/lesson.entity';

export class CreateLessonDto {
  @IsEnum(LessonStatus)
  @IsOptional()
  status?: LessonStatus;

  @IsNumber()
  bookingId: number;

  @IsNumber()
  studentId: number;

  @IsNumber()
  teacherId: number;

  @IsNumber()
  @IsOptional()
  sheetMusicId?: number;

  @IsString()
  @IsOptional()
  roomId?: string;

  @IsString()
  @IsOptional()
  teacherVideoUrl?: string;

  @IsString()
  @IsOptional()
  studentVideoUrl?: string;

  @IsDateString()
  @IsOptional()
  actualStart?: string;

  @IsDateString()
  @IsOptional()
  actualEnd?: string;
}
