import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { WineService } from './wine.service';
import { CreateWineDto, UpdateWineDto } from './dto';

@Controller('wines')
export class WineController {
  constructor(private readonly wineService: WineService) {}

  @Post()
  create(@Body() dto: CreateWineDto) {
    return this.wineService.create(dto);
  }

  @Get()
  findAll(
    @Query('region') region?: string,
    @Query('chateau') chateau?: string,
    @Query('vintage') vintage?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.wineService.findAll({ region, chateau, vintage, keyword });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wineService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWineDto) {
    return this.wineService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.wineService.remove(id);
  }
}
