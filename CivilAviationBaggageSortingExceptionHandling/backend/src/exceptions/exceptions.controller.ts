import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { ExceptionsService } from './exceptions.service';
import { CreateExceptionOrderDto } from './dto/create-exception-order.dto';
import { UpdateExceptionOrderDto } from './dto/update-exception-order.dto';

@Controller('exceptions')
export class ExceptionsController {
  constructor(private readonly exceptionsService: ExceptionsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') exceptionType?: string,
  ) {
    return this.exceptionsService.findAll(
      parseInt(page || '1', 10),
      parseInt(limit || '20', 10),
      status,
      exceptionType,
    );
  }

  @Get('sla-warnings')
  getSlaWarnings() {
    return this.exceptionsService.getSlaWarnings();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exceptionsService.findOne(parseInt(id, 10));
  }

  @Post()
  create(@Body() dto: CreateExceptionOrderDto) {
    return this.exceptionsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExceptionOrderDto) {
    return this.exceptionsService.update(parseInt(id, 10), dto);
  }
}
