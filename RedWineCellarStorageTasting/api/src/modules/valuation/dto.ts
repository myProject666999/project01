import { IsNumber, IsOptional } from 'class-validator';

export class UpdateMarketPriceDto {
  @IsNumber()
  marketPrice: number;
}
