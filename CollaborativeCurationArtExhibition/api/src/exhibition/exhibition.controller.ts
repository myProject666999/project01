import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ExhibitionService } from './exhibition.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';

@Controller('exhibitions')
export class ExhibitionController {
  constructor(private exhibitionService: ExhibitionService) {}

  @Get()
  findAll() {
    return this.exhibitionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitionService.findOne(id);
  }

  @Post()
  create(@Body() createExhibitionDto: CreateExhibitionDto) {
    return this.exhibitionService.create(createExhibitionDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExhibitionDto: UpdateExhibitionDto,
  ) {
    return this.exhibitionService.update(id, updateExhibitionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitionService.remove(id);
  }
}
