import { Controller, Get, Post, Put, Delete, Patch, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ArtworkService } from './artwork.service';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { UpdateArtworkStatusDto } from './dto/update-artwork-status.dto';
import { BatchStatusDto } from './dto/batch-status.dto';

@Controller('artworks')
export class ArtworkController {
  constructor(private artworkService: ArtworkService) {}

  @Get()
  findAll(@Query('exhibitionId') exhibitionId?: number) {
    if (exhibitionId) {
      return this.artworkService.findByExhibition(exhibitionId);
    }
    return this.artworkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.artworkService.findOne(id);
  }

  @Post()
  create(@Body() createArtworkDto: CreateArtworkDto) {
    return this.artworkService.create(createArtworkDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArtworkDto: UpdateArtworkDto,
  ) {
    return this.artworkService.update(id, updateArtworkDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.artworkService.remove(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateArtworkStatusDto,
  ) {
    return this.artworkService.updateStatus(id, updateStatusDto);
  }

  @Post('batch-status')
  batchStatus(@Body() batchStatusDto: BatchStatusDto) {
    return this.artworkService.batchStatus(batchStatusDto);
  }
}
