import { IsNumber, IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateTastingNoteDto {
  @IsNumber()
  wineId: number;

  @IsNumber()
  inventoryId: number;

  @IsDateString()
  tastingDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  companions?: string;

  @IsNumber()
  appearanceScore: number;

  @IsNumber()
  aromaScore: number;

  @IsNumber()
  tasteScore: number;

  @IsNumber()
  overallScore: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTastingNoteDto {
  @IsOptional()
  @IsDateString()
  tastingDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  companions?: string;

  @IsOptional()
  @IsNumber()
  appearanceScore?: number;

  @IsOptional()
  @IsNumber()
  aromaScore?: number;

  @IsOptional()
  @IsNumber()
  tasteScore?: number;

  @IsOptional()
  @IsNumber()
  overallScore?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
