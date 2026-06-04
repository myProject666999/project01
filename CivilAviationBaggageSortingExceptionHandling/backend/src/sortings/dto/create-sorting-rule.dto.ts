import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateSortingRuleDto {
  @IsString()
  flight_no: string;

  @IsNumber()
  port_id: number;

  @IsDateString()
  effective_start: string;

  @IsDateString()
  effective_end: string;

  @IsOptional()
  @IsNumber()
  priority?: number;
}
