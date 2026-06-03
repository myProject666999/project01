import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { TastingService } from './tasting.service';
import { CreateTastingNoteDto, UpdateTastingNoteDto } from './dto';

@Controller('tasting-notes')
export class TastingController {
  constructor(private readonly tastingService: TastingService) {}

  @Post()
  create(@Body() dto: CreateTastingNoteDto) {
    return this.tastingService.create(dto);
  }

  @Get()
  findAll() {
    return this.tastingService.findAll();
  }

  @Get('wine/:wineId')
  findByWine(@Param('wineId', ParseIntPipe) wineId: number) {
    return this.tastingService.findByWine(wineId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tastingService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTastingNoteDto) {
    return this.tastingService.update(id, dto);
  }
}
