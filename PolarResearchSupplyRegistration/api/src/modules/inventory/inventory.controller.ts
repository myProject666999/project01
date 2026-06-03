import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { QueryInventoryDto } from '../../dto/inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get()
  findAll(@Query() query: QueryInventoryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get(':id/records')
  getRecords(@Param('id', ParseIntPipe) id: number) {
    return this.service.getRecords(id);
  }
}
