import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateEvaluationDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
