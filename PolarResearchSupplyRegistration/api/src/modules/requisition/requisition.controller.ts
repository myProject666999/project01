import { Controller, Get, Post, Put, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RequisitionService } from './requisition.service';
import { CreateRequisitionDto, ApproveRequisitionDto, RejectRequisitionDto } from '../../dto/requisition.dto';

@Controller('requisitions')
export class RequisitionController {
  constructor(private readonly service: RequisitionService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRequisitionDto) {
    return this.service.create(dto);
  }

  @Put(':id/approve')
  approve(@Param('id', ParseIntPipe) id: number, @Body() dto: ApproveRequisitionDto) {
    return this.service.approve(id, dto);
  }

  @Put(':id/reject')
  reject(@Param('id', ParseIntPipe) id: number, @Body() dto: RejectRequisitionDto) {
    return this.service.reject(id, dto);
  }
}
