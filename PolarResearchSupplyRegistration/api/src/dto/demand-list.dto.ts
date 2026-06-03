import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDemandListItemDto {
  @IsNumber()
  @IsNotEmpty()
  requiredQuantity: number;

  @IsString()
  @IsOptional()
  remark?: string;
}

export class GenerateDemandListDto {
  @IsInt()
  @IsNotEmpty()
  voyageId: number;

  @IsString()
  @IsOptional()
  name?: string;
}
