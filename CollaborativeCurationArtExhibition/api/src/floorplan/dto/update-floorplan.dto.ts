import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateFloorPlanDto {
  @IsString()
  @IsOptional()
  backgroundUrl?: string;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsObject()
  @IsOptional()
  layoutData?: object;
}
