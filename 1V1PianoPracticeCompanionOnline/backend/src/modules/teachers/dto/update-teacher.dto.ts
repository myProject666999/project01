import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel, ProficiencyLevel } from '../../../entities/teacher-skill.entity';

class SkillDto {
  @IsNumber()
  @IsOptional()
  id?: number;

  @IsEnum(DifficultyLevel)
  difficultyLevel: DifficultyLevel;

  @IsEnum(ProficiencyLevel)
  @IsOptional()
  proficiencyLevel?: ProficiencyLevel;
}

export class UpdateTeacherDto {
  @IsNumber()
  @IsOptional()
  teachingYears?: number;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  certifications?: string;

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @IsBoolean()
  @IsOptional()
  chineseTeaching?: boolean;

  @IsString()
  @IsOptional()
  videoIntroUrl?: string;

  @IsOptional()
  availableTimes?: object;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  @IsOptional()
  skills?: SkillDto[];
}
