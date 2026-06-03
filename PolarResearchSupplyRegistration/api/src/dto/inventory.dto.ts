import { IsOptional, IsInt, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryInventoryDto {
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  @IsInt()
  @IsOptional()
  warehouseId?: number;

  @Transform(({ value }) => value ? parseInt(value) : undefined)
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  keyword?: string;
}
