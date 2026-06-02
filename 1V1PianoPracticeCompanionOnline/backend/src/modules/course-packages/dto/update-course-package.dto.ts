import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateCoursePackageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  lessonCount?: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
