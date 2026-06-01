import { IsNumber, IsOptional, IsObject, IsString } from 'class-validator';

export class CreateFloorPlanDto {
  @IsNumber()
  exhibitionId: number;

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
