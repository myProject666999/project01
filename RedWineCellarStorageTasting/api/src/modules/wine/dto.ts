import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGrapeVarietyDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  percentage: number;
}

export class CreateWineDto {
  @IsString()
  region: string;

  @IsString()
  chateau: string;

  @IsNumber()
  vintage: number;

  @IsNumber()
  abv: number;

  @IsNumber()
  drinkFrom: number;

  @IsNumber()
  drinkTo: number;

  @IsNumber()
  purchasePrice: number;

  @IsOptional()
  @IsNumber()
  marketPrice?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGrapeVarietyDto)
  grapeVarieties: CreateGrapeVarietyDto[];
}

export class UpdateWineDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  chateau?: string;

  @IsOptional()
  @IsNumber()
  vintage?: number;

  @IsOptional()
  @IsNumber()
  abv?: number;

  @IsOptional()
  @IsNumber()
  drinkFrom?: number;

  @IsOptional()
  @IsNumber()
  drinkTo?: number;

  @IsOptional()
  @IsNumber()
  purchasePrice?: number;

  @IsOptional()
  @IsNumber()
  marketPrice?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGrapeVarietyDto)
  grapeVarieties?: CreateGrapeVarietyDto[];
}
