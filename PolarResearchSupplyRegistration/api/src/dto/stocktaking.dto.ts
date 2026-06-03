import { IsString, IsOptional, IsInt, IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStocktakingDto {
  @IsString()
  @IsOptional()
  scopeType?: string;

  @IsInt()
  @IsOptional()
  scopeId?: number;

  @IsInt()
  @IsNotEmpty()
  createdBy: number;
}

export class UpdateStocktakingItemDto {
  @IsNumber()
  @IsNotEmpty()
  actualQuantity: number;

  @IsString()
  @IsOptional()
  remark?: string;
}
