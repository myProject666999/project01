import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DowntimeRecord } from '../../entities/downtime-record.entity';
import { DowntimeReason } from '../../entities/downtime-reason.entity';
import { Shift } from '../../entities/shift.entity';
import { DowntimeService } from './downtime.service';
import { DowntimeController } from './downtime.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DowntimeRecord, DowntimeReason, Shift]),
  ],
  controllers: [DowntimeController],
  providers: [DowntimeService],
  exports: [DowntimeService],
})
export class DowntimeModule {}
