import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { EvaluationFrom } from '../../../entities/lesson-evaluation.entity';

export class CreateEvaluationDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsEnum(EvaluationFrom)
  from: EvaluationFrom;

  @IsNumber()
  lessonId: number;

  @IsNumber()
  @IsOptional()
  studentId?: number;

  @IsNumber()
  @IsOptional()
  teacherId?: number;
}
