import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { AnnotationType } from '../../../entities/lesson-annotation.entity';

export class UpdateAnnotationDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(AnnotationType)
  @IsOptional()
  type?: AnnotationType;

  @IsNumber()
  @IsOptional()
  measure?: number;

  @IsNumber()
  @IsOptional()
  timestamp?: number;
}
