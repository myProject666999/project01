import { IsString, IsOptional, IsInt, IsNotEmpty, IsNumber, IsArray, ValidateNested, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { VoyageStatus } from '../entities';

export class CreateVoyageDto {
  @IsString()
  @IsNotEmpty()
  voyageNo: string;

  @IsString()
  @IsOptional()
  shipName?: string;

  @IsDateString()
  @IsNotEmpty()
  arrivalDate: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateVoyageDto {
  @IsString()
  @IsOptional()
  voyageNo?: string;

  @IsString()
  @IsOptional()
  shipName?: string;

  @IsDateString()
  @IsOptional()
  arrivalDate?: string;

  @IsEnum(VoyageStatus)
  @IsOptional()
  status?: VoyageStatus;

  @IsString()
  @IsOptional()
  description?: string;
}

export class VoyageSupplyItemDto {
  @IsInt()
  @IsNotEmpty()
  supplyId: number;

  @IsInt()
  @IsNotEmpty()
  targetWarehouseId: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class AddVoyageSuppliesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VoyageSupplyItemDto)
  supplies: VoyageSupplyItemDto[];
}

export class StockInItemDto {
  @IsInt()
  @IsNotEmpty()
  voyageSupplyId: number;

  @IsNumber()
  @IsNotEmpty()
  actualQuantity: number;
}

export class StockInDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockInItemDto)
  items: StockInItemDto[];
}
