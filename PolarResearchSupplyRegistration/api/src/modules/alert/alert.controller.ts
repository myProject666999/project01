import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { AlertService } from './alert.service';

@Controller('alerts')
export class AlertController {
  constructor(private readonly service: AlertService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post('calculate')
  calculate() {
    return this.service.calculate();
  }

  @Post(':id/resolve')
  resolve(@Param('id', ParseIntPipe) id: number) {
    return this.service.resolve(id);
  }
}
