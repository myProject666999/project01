import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ArtistReplacementService } from './artist-replacement.service';
import { CreateArtistReplacementDto } from './dto/create-artist-replacement.dto';
import { UpdateArtistReplacementDto } from './dto/update-artist-replacement.dto';

@Controller('artist-replacements')
export class ArtistReplacementController {
  constructor(private replacementService: ArtistReplacementService) {}

  @Get()
  findAll() {
    return this.replacementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.replacementService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateArtistReplacementDto) {
    return this.replacementService.create(createDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateArtistReplacementDto,
  ) {
    return this.replacementService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.replacementService.remove(id);
  }

  @Post(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.replacementService.approve(id);
  }

  @Post(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.replacementService.reject(id);
  }
}
