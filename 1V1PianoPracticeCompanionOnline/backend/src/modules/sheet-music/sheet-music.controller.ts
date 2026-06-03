import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SheetMusicService } from './sheet-music.service';
import { CreateSheetMusicDto } from './dto/create-sheet-music.dto';
import { UpdateSheetMusicDto } from './dto/update-sheet-music.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sheet-music')
export class SheetMusicController {
  constructor(private readonly sheetMusicService: SheetMusicService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createSheetMusicDto: CreateSheetMusicDto) {
    return this.sheetMusicService.create(createSheetMusicDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    if (userId) {
      return this.sheetMusicService.findByCreator(+userId);
    }
    return this.sheetMusicService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sheetMusicService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateSheetMusicDto: UpdateSheetMusicDto) {
    return this.sheetMusicService.update(+id, updateSheetMusicDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.sheetMusicService.remove(+id);
  }
}
