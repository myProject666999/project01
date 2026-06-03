import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingLog } from '../entities/tracking-log.entity';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':mailingId')
  getTrackingLogs(@Param('mailingId') mailingId: string): Promise<TrackingLog[]> {
    return this.trackingService.getTrackingLogs(+mailingId);
  }

  @Post('poll')
  triggerPoll() {
    return this.trackingService.pollTrackingStatus();
  }

  @Post('log')
  addTrackingLog(@Body() body: { mailingId: number; status: any; location: string; description: string }): Promise<TrackingLog> {
    return this.trackingService.addTrackingLog(body.mailingId, body.status, body.location, body.description);
  }
}
