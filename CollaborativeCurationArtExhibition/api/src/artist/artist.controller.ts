import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ArtistService } from './artist.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Controller('artists')
export class ArtistController {
  constructor(private artistService: ArtistService) {}

  @Get()
  findAll(@Query('exhibitionId') exhibitionId?: number) {
    if (exhibitionId) {
      return this.artistService.findByExhibition(exhibitionId);
    }
    return this.artistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.artistService.findOne(id);
  }

  @Post()
  create(@Body() createArtistDto: CreateArtistDto) {
    return this.artistService.create(createArtistDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArtistDto: UpdateArtistDto,
  ) {
    return this.artistService.update(id, updateArtistDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.artistService.remove(id);
  }

  @Post(':id/confirm')
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.artistService.confirm(id);
  }

  @Post(':id/withdraw')
  withdraw(@Param('id', ParseIntPipe) id: number) {
    return this.artistService.withdraw(id);
  }

  @Post(':id/replace')
  replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() replacementData: { name: string; avatar?: string; bio?: string; email?: string; phone?: string },
  ) {
    return this.artistService.replace(id, replacementData);
  }
}
