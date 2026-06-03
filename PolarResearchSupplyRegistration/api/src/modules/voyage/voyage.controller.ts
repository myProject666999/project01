import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { VoyageService } from './voyage.service';
import { CreateVoyageDto, UpdateVoyageDto, AddVoyageSuppliesDto, StockInDto } from '../../dto/voyage.dto';

@Controller('voyages')
export class VoyageController {
  constructor(private readonly service: VoyageService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateVoyageDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVoyageDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/supplies')
  addSupplies(@Param('id', ParseIntPipe) id: number, @Body() dto: AddVoyageSuppliesDto) {
    return this.service.addSupplies(id, dto);
  }

  @Post(':id/stock-in')
  stockIn(@Param('id', ParseIntPipe) id: number, @Body() dto: StockInDto) {
    return this.service.stockIn(id, dto);
  }
}
