import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ConsumptionTrendQueryDto } from '../../dto/dashboard.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Get('alerts')
  getAlerts() {
    return this.service.getAlerts();
  }

  @Get('trends')
  getConsumptionTrend(@Query() query: ConsumptionTrendQueryDto) {
    return this.service.getConsumptionTrend(query);
  }

  @Get('recent-voyages')
  getRecentVoyages() {
    return this.service.getRecentVoyages();
  }
}
