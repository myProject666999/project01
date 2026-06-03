import { Controller, Get } from '@nestjs/common';
import { RoiService } from './roi.service';

@Controller('roi')
export class RoiController {
  constructor(private readonly roiService: RoiService) {}

  @Get('samples')
  getSampleROI() {
    return this.roiService.calculateSampleROI();
  }

  @Get('dashboard')
  getDashboardStats() {
    return this.roiService.getDashboardStats();
  }
}
