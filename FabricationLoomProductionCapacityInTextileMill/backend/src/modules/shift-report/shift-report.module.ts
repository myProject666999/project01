import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ShiftReport } from '../../entities/shift-report.entity';
import { OeeStats } from '../../entities/oee-stats.entity';
import { DowntimeRecord } from '../../entities/downtime-record.entity';
import { DowntimeReason } from '../../entities/downtime-reason.entity';
import { LoomRealtimeData } from '../../entities/loom-realtime-data.entity';
import { Shift } from '../../entities/shift.entity';
import { Loom } from '../../entities/loom.entity';
import { ShiftReportService } from './shift-report.service';
import { ShiftReportController } from './shift-report.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShiftReport,
      OeeStats,
      DowntimeRecord,
      DowntimeReason,
      LoomRealtimeData,
      Shift,
      Loom,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [ShiftReportController],
  providers: [ShiftReportService],
  exports: [ShiftReportService],
})
export class ShiftReportModule {}
