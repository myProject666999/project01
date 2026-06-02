import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { AnnotationType } from '../../../entities/lesson-annotation.entity';

export class CreateAnnotationDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(AnnotationType)
  @IsOptional()
  type?: AnnotationType;

  @IsNumber()
  @IsOptional()
  measure?: number;

  @IsNumber()
  @IsOptional()
  timestamp?: number;

  @IsNumber()
  lessonId: number;

  @IsNumber()
  createdById: number;
}
