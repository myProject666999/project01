import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ConsumptionTrendQueryDto {
  @Transform(({ value }) => value ? parseInt(value) : 30)
  @IsOptional()
  days?: number;

  @IsString()
  @IsOptional()
  groupBy?: string;
}
