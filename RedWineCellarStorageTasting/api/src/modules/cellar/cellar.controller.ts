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
import { CellarSlotWithWine, CellarLayout } from './types';
import { Inventory } from '@/entities/inventory.entity';

@Controller('cellar')
export class CellarController {
  constructor(private readonly cellarService: CellarService) {}

  @Get('slots')
  getSlots(): Promise<CellarSlotWithWine[]> {
    return this.cellarService.getSlots();
  }

  @Get('slots/available')
  getAvailableSlots(): Promise<CellarSlotWithWine[]> {
    return this.cellarService.getAvailableSlots();
  }

  @Post('stock-in')
  stockIn(@Body() dto: StockInDto): Promise<Inventory> {
    return this.cellarService.stockIn(dto);
  }

  @Post('stock-out/:id')
  stockOut(@Param('id', ParseIntPipe) id: number): Promise<Inventory> {
    return this.cellarService.stockOut(id);
  }

  @Get('layout')
  getLayout(): Promise<CellarLayout> {
    return this.cellarService.getLayout();
  }
}
