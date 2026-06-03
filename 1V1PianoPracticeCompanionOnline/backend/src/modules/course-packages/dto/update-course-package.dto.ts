import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { CourseLevel } from '../../../entities/course-package.entity';

export class UpdateCoursePackageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  totalLessons?: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  lessonDuration?: number;

  @IsEnum(CourseLevel)
  @IsOptional()
  level?: CourseLevel;

  @IsNumber()
  @IsOptional()
  validDays?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
