import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { BaggagesService } from './baggages.service';
import { ScanBaggageDto } from './dto/scan-baggage.dto';

@Controller('baggages')
export class BaggagesController {
  constructor(private readonly baggagesService: BaggagesService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.baggagesService.findAll(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      status,
    );
  }

  @Get(':tagCode')
  findByTagCode(@Param('tagCode') tagCode: string) {
    return this.baggagesService.findByTagCode(tagCode);
  }

  @Post('scan')
  scanBaggage(@Body() dto: ScanBaggageDto) {
    return this.baggagesService.scanBaggage(dto);
  }

  @Get(':baggageId/scan-logs')
  getScanLogs(@Param('baggageId') baggageId: string) {
    return this.baggagesService.getScanLogs(parseInt(baggageId, 10));
  }
}
