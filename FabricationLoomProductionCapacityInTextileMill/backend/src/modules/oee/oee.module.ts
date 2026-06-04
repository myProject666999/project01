import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { OeeStats } from '../../entities/oee-stats.entity';
import { LoomRealtimeData } from '../../entities/loom-realtime-data.entity';
import { DowntimeRecord } from '../../entities/downtime-record.entity';
import { Shift } from '../../entities/shift.entity';
import { Loom } from '../../entities/loom.entity';
import { OeeService } from './oee.service';
import { OeeController } from './oee.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OeeStats, LoomRealtimeData, DowntimeRecord, Shift, Loom]),
    ScheduleModule.forRoot(),
  ],
  controllers: [OeeController],
  providers: [OeeService],
  exports: [OeeService],
})
export class OeeModule {}
