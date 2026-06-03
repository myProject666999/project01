import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { CourseLevel } from '../../../entities/course-package.entity';

export class CreateCoursePackageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  totalLessons: number;

  @IsNumber()
  price: number;

  @IsNumber()
  lessonDuration: number;

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
