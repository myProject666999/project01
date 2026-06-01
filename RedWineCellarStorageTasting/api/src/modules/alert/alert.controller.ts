import { Controller, Get } from '@nestjs/common';
import { AlertService } from './alert.service';

@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get('drink-window')
  getDrinkWindowAlerts() {
    return this.alertService.getDrinkWindowAlerts();
  }
}
