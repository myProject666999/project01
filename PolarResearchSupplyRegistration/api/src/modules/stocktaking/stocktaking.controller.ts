import { Controller, Get, Post, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { StocktakingService } from './stocktaking.service';
import { CreateStocktakingDto, UpdateStocktakingItemDto, ApproveStocktakingDto } from '../../dto/stocktaking.dto';

@Controller('stocktaking')
export class StocktakingController {
  constructor(private readonly service: StocktakingService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateStocktakingDto) {
    return this.service.create(dto);
  }

  @Put(':id/items/:itemId')
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateStocktakingItemDto,
  ) {
    return this.service.updateItem(id, itemId, dto);
  }

  @Post(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.service.complete(id);
  }

  @Post(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number, @Body() dto: ApproveStocktakingDto) {
    return this.service.approve(id, dto);
  }
}
