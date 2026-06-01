import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ValuationService } from './valuation.service';
import { UpdateMarketPriceDto } from './dto';

@Controller('valuation')
export class ValuationController {
  constructor(private readonly valuationService: ValuationService) {}

  @Get('summary')
  getSummary() {
    return this.valuationService.getSummary();
  }

  @Get('details')
  getDetails() {
    return this.valuationService.getDetails();
  }

  @Put('market-price/:wineId')
  updateMarketPrice(
    @Param('wineId', ParseIntPipe) wineId: number,
    @Body() dto: UpdateMarketPriceDto,
  ) {
    return this.valuationService.updateMarketPrice(wineId, dto);
  }
}
