import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { LessonStatus } from '../../../entities/lesson.entity';

export class UpdateLessonDto {
  @IsEnum(LessonStatus)
  @IsOptional()
  status?: LessonStatus;

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
