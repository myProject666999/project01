import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateEvaluationDto {
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  rhythmScore?: number;

  @IsString()
  @IsOptional()
  rhythmComment?: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  intonationScore?: number;

  @IsString()
  @IsOptional()
  intonationComment?: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  expressionScore?: number;

  @IsString()
  @IsOptional()
  expressionComment?: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  accuracyScore?: number;

  @IsString()
  @IsOptional()
  accuracyComment?: string;

  @IsString()
  @IsOptional()
  overallComment?: string;

  @IsString()
  @IsOptional()
  nextGoal?: string;

  @IsString()
  @IsOptional()
  practiceAssignments?: string;
}
