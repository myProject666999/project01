import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDecimal } from 'class-validator';
import { AnnotationType } from '../../../entities/lesson-annotation.entity';

export class CreateAnnotationDto {
  @IsEnum(AnnotationType)
  annotationType: AnnotationType;

  @IsNumber()
  @IsOptional()
  pageNumber?: number;

  @IsNumber()
  positionX: number;

  @IsNumber()
  positionY: number;

  @IsNumber()
  @IsOptional()
  endPositionX?: number;

  @IsNumber()
  @IsOptional()
  endPositionY?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsNumber()
  @IsOptional()
  lineWidth?: number;

  @IsString()
  @IsOptional()
  content?: string;

  @IsNumber()
  timestampSeconds: number;

  @IsNumber()
  lessonId: number;

  @IsNumber()
  createdById: number;
}
