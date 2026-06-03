import { IsString, IsOptional, IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSupplyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @IsOptional()
  calories?: number;

  @IsInt()
  @IsOptional()
  shelfLifeDays?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateSupplyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  calories?: number;

  @IsInt()
  @IsOptional()
  shelfLifeDays?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
