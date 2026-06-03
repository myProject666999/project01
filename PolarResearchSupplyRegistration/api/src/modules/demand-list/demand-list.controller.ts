import { Controller, Get, Put, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { DemandListService } from './demand-list.service';
import { UpdateDemandListItemDto, GenerateDemandListDto } from '../../dto/demand-list.dto';

@Controller('demand-list')
export class DemandListController {
  constructor(private readonly service: DemandListService) {}

  @Get('voyage/:voyageId')
  findByVoyage(@Param('voyageId', ParseIntPipe) voyageId: number) {
    return this.service.findByVoyage(voyageId);
  }

  @Put('items/:id')
  updateItem(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDemandListItemDto) {
    return this.service.updateItem(id, dto);
  }

  @Post('generate')
  generateFromAlerts(@Body() dto: GenerateDemandListDto) {
    return this.service.generateFromAlerts(dto);
  }
}
