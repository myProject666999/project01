import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { AnnotationType } from '../../../entities/lesson-annotation.entity';

export class UpdateAnnotationDto {
  @IsEnum(AnnotationType)
  @IsOptional()
  annotationType?: AnnotationType;

  @IsNumber()
  @IsOptional()
  pageNumber?: number;

  @IsNumber()
  @IsOptional()
  positionX?: number;

  @IsNumber()
  @IsOptional()
  positionY?: number;

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
  @IsOptional()
  timestampSeconds?: number;
}
