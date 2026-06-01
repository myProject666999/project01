import { IsNumber } from 'class-validator';

export class StockInDto {
  @IsNumber()
  wineId: number;

  @IsNumber()
  slotId: number;
}
