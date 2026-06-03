import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CouriersService } from './couriers.service';
import { Courier } from '../entities/courier.entity';

@Controller('couriers')
export class CouriersController {
  constructor(private readonly couriersService: CouriersService) {}

  @Get()
  findAll(): Promise<Courier[]> {
    return this.couriersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Courier> {
    return this.couriersService.findOne(+id);
  }

  @Post()
  create(@Body() courierData: Partial<Courier>): Promise<Courier> {
    return this.couriersService.create(courierData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() courierData: Partial<Courier>): Promise<Courier> {
    return this.couriersService.update(+id, courierData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.couriersService.remove(+id);
  }
}
