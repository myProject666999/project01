import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Mailing } from '../entities/mailing.entity';
import { TrackingLog } from '../entities/tracking-log.entity';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    @InjectRepository(Mailing)
    private mailingsRepository: Repository<Mailing>,
    @InjectRepository(TrackingLog)
    private trackingLogsRepository: Repository<TrackingLog>,
  ) {}

  async getTrackingLogs(mailingId: number): Promise<TrackingLog[]> {
    return this.trackingLogsRepository.find({
      where: { mailing_id: mailingId },
      order: { tracked_at: 'DESC' }
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async pollTrackingStatus() {
    this.logger.log('Starting tracking status polling...');
    
    const activeMailings = await this.mailingsRepository.find({
      where: [{ status: 'pending' }, { status: 'in_transit' }]
    });

    for (const mailing of activeMailings) {
      await this.simulateTrackingUpdate(mailing);
    }

    this.logger.log(`Polling completed for ${activeMailings.length} shipments`);
  }

  private async simulateTrackingUpdate(mailing: Mailing) {
    const random = Math.random();
    let newStatus: 'pending' | 'in_transit' | 'delivered' | 'exception' = mailing.status;
    let location = '';
    let description = '';

    if (mailing.status === 'pending') {
      if (random > 0.3) {
        newStatus = 'in_transit';
        location = 'Origin Warehouse';
        description = 'Shipment has been picked up and is in transit';
      }
    } else if (mailing.status === 'in_transit') {
      if (random > 0.7) {
        newStatus = 'delivered';
        location = 'Destination';
        description = 'Shipment has been delivered successfully';
      } else if (random < 0.05) {
        newStatus = 'exception';
        location = 'In Transit';
        description = 'Delivery exception - please contact courier';
      } else {
        location = 'In Transit - ' + ['Hong Kong', 'Singapore', 'Dubai', 'Frankfurt'][Math.floor(Math.random() * 4)];
        description = 'Shipment is in transit';
      }
    }

    if (newStatus !== mailing.status || location) {
      await this.mailingsRepository.update(mailing.id, { status: newStatus });
      
      const trackingLog = this.trackingLogsRepository.create({
        mailing_id: mailing.id,
        status: newStatus,
        location,
        description
      });
      await this.trackingLogsRepository.save(trackingLog);

      this.logger.log(`Updated tracking for ${mailing.tracking_number}: ${newStatus}`);
    }
  }

  async addTrackingLog(mailingId: number, status: any, location: string, description: string): Promise<TrackingLog> {
    const log = this.trackingLogsRepository.create({
      mailing_id: mailingId,
      status,
      location,
      description
    });
    return this.trackingLogsRepository.save(log);
  }
}
