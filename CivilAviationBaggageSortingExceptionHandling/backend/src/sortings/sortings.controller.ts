import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { SortingsService } from './sortings.service';
import { CreateSortingPortDto } from './dto/create-sorting-port.dto';
import { CreateSortingRuleDto } from './dto/create-sorting-rule.dto';

@Controller('sortings')
export class SortingsController {
  constructor(private readonly sortingsService: SortingsService) {}

  @Get('ports')
  findAllPorts() {
    return this.sortingsService.findAllPorts();
  }

  @Post('ports')
  createPort(@Body() dto: CreateSortingPortDto) {
    return this.sortingsService.createPort(dto);
  }

  @Get('rules')
  findAllRules() {
    return this.sortingsService.findAllRules();
  }

  @Get('rules/active')
  getActiveRules() {
    return this.sortingsService.getActiveRules();
  }

  @Post('rules')
  createRule(@Body() dto: CreateSortingRuleDto) {
    return this.sortingsService.createRule(dto);
  }

  @Get('lookup/:flightNo')
  getSortingPortByFlight(
    @Param('flightNo') flightNo: string,
    @Query('time') time?: string,
  ) {
    const queryTime = time ? new Date(time) : undefined;
    return this.sortingsService.getSortingPortByFlight(flightNo, queryTime);
  }
}
