import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { GuestService } from './guest.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

@Controller('guests')
export class GuestController {
  constructor(private guestService: GuestService) {}

  @Get()
  findAll(@Query('exhibitionId') exhibitionId?: number) {
    if (exhibitionId) {
      return this.guestService.findByExhibition(exhibitionId);
    }
    return this.guestService.findAll();
  }

  @Get('checkin-stats')
  getCheckinStats(@Query('exhibitionId', ParseIntPipe) exhibitionId: number) {
    return this.guestService.getCheckinStats(exhibitionId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.guestService.findOne(id);
  }

  @Get(':id/qrcode')
  getQrCode(@Param('id', ParseIntPipe) id: number) {
    return this.guestService.getQrCode(id);
  }

  @Post()
  create(@Body() createGuestDto: CreateGuestDto) {
    return this.guestService.create(createGuestDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGuestDto: UpdateGuestDto,
  ) {
    return this.guestService.update(id, updateGuestDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.guestService.remove(id);
  }

  @Post(':id/checkin')
  checkin(@Param('id', ParseIntPipe) id: number) {
    return this.guestService.checkin(id);
  }
}
