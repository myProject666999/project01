import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { CellarService } from './cellar.service';
import { StockInDto } from './dto';

@Controller('cellar')
export class CellarController {
  constructor(private readonly cellarService: CellarService) {}

  @Get('slots')
  getSlots() {
    return this.cellarService.getSlots();
  }

  @Get('slots/available')
  getAvailableSlots() {
    return this.cellarService.getAvailableSlots();
  }

  @Post('stock-in')
  stockIn(@Body() dto: StockInDto) {
    return this.cellarService.stockIn(dto);
  }

  @Post('stock-out/:id')
  stockOut(@Param('id', ParseIntPipe) id: number) {
    return this.cellarService.stockOut(id);
  }

  @Get('layout')
  getLayout() {
    return this.cellarService.getLayout();
  }
}
