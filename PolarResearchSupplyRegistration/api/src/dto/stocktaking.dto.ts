import { IsString, IsOptional, IsInt, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { StocktakingScopeType } from '../entities';

export class CreateStocktakingDto {
  @IsEnum(StocktakingScopeType)
  @IsOptional()
  scopeType?: StocktakingScopeType;

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

export class ApproveStocktakingDto {
  @IsInt()
  @IsNotEmpty()
  approvedBy: number;
}
