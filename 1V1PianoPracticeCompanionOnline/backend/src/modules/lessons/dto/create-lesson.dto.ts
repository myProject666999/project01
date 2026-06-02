import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { LessonStatus } from '../../../entities/lesson.entity';

export class CreateLessonDto {
  @IsString()
  @IsOptional()
  lessonPlan?: string;

  @IsEnum(LessonStatus)
  @IsOptional()
  status?: LessonStatus;

  @IsNumber()
  @IsOptional()
  sheetMusicId?: number;

  @IsNumber()
  bookingId: number;
}
