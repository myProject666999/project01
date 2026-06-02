import { IsString, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { LessonStatus } from '../../../entities/lesson.entity';

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  lessonPlan?: string;

  @IsEnum(LessonStatus)
  @IsOptional()
  status?: LessonStatus;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsDateString()
  @IsOptional()
  actualStartTime?: string;

  @IsDateString()
  @IsOptional()
  actualEndTime?: string;

  @IsNumber()
  @IsOptional()
  sheetMusicId?: number;
}
