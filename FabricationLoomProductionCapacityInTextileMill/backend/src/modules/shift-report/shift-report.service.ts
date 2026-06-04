import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { ShiftReport } from '../../entities/shift-report.entity';
import { OeeStats } from '../../entities/oee-stats.entity';
import { DowntimeRecord } from '../../entities/downtime-record.entity';
import { DowntimeReason } from '../../entities/downtime-reason.entity';
import { LoomRealtimeData } from '../../entities/loom-realtime-data.entity';
import { Shift } from '../../entities/shift.entity';
import { Loom } from '../../entities/loom.entity';

@Injectable()
export class ShiftReportService {
  private readonly logger = new Logger(ShiftReportService.name);

  constructor(
    @InjectRepository(ShiftReport)
    private readonly shiftReportRepository: Repository<ShiftReport>,
    @InjectRepository(OeeStats)
    private readonly oeeStatsRepository: Repository<OeeStats>,
    @InjectRepository(DowntimeRecord)
    private readonly downtimeRepository: Repository<DowntimeRecord>,
    @InjectRepository(DowntimeReason)
    private readonly downtimeReasonRepository: Repository<DowntimeReason>,
    @InjectRepository(LoomRealtimeData)
    private readonly realtimeDataRepository: Repository<LoomRealtimeData>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(Loom)
    private readonly loomRepository: Repository<Loom>,
  ) {}

  @Cron('0 30 0,8,16 * * *')
  async generateShiftReports(): Promise<void> {
    this.logger.log('开始生成班产报表...');
    
    try {
      const shifts = await this.shiftRepository.find();
      const looms = await this.loomRepository.find({ where: { status: 1 } });
      const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');

      for (const shift of shifts) {
        let reportDate = today;
        if (shift.name === '晚班') {
          reportDate = yesterday;
        }

        for (const loom of looms) {
          await this.generateReport(loom.id, shift.id, reportDate);
        }
      }
      
      this.logger.log('班产报表生成完成');
    } catch (error) {
      this.logger.error(`班产报表生成失败: ${error.message}`, error.stack);
    }
  }

  async generateReport(loomId: number, shiftId: number, shiftDate: string): Promise<ShiftReport> {
    const shift = await this.shiftRepository.findOne({ where: { id: shiftId } });
    const loom = await this.loomRepository.findOne({ where: { id: loomId } });
    const date = moment(shiftDate);

    if (!shift || !loom) {
      throw new NotFoundException('班次或织机不存在');
    }

    const shiftStart = this.getShiftDateTime(shiftDate, shift.startTime);
    const shiftEnd = this.getShiftEndDateTime(shiftDate, shift.startTime, shift.endTime);

    const realtimeData = await this.realtimeDataRepository.find({
      where: {
        loomId,
        timestamp: Between(shiftStart, shiftEnd) as any,
      },
      order: { timestamp: 'ASC' },
    });

    const downtimeRecords = await this.downtimeRepository.find({
      where: {
        loomId,
        shiftId,
        shiftDate: date.toDate(),
      },
      relations: ['reasonId'],
    });

    const oeeStats = await this.oeeStatsRepository.findOne({
      where: { loomId, shiftId, statDate: date.toDate() },
    });

    const actualOutput = realtimeData.reduce((sum, d) => sum + d.incrementalMeters, 0);
    const defectiveOutput = realtimeData.reduce((sum, d) => sum + d.defectiveMeters, 0);
    const goodOutput = actualOutput - defectiveOutput;
    const totalDowntime = downtimeRecords.reduce((sum, d) => sum + d.durationMinutes, 0);
    
    const runningSeconds = realtimeData.length > 1 
      ? (realtimeData[realtimeData.length - 1].timestamp.getTime() - realtimeData[0].timestamp.getTime()) / 1000 
      : 0;
    const runningHours = (runningSeconds / 3600) * (realtimeData.filter(d => d.runningStatus === 1).length / Math.max(1, realtimeData.length));
    
    const avgSpeed = realtimeData.length > 0
      ? realtimeData.reduce((sum, d) => sum + d.speed, 0) / realtimeData.length
      : 0;

    const downtimeBreakdown = await this.aggregateDowntime(downtimeRecords);

    const existingReport = await this.shiftReportRepository.findOne({
      where: { loomId, shiftId, shiftDate: date.toDate() },
    });

    const reportData: Partial<ShiftReport> = {
      loomId,
      shiftId,
      shiftDate: date.toDate(),
      plannedOutput: loom.ratedCapacity * shift.plannedHours,
      actualOutput,
      goodOutput,
      defectiveOutput,
      totalDowntime,
      downtimeBreakdown,
      runningHours: Math.round(runningHours * 100) / 100,
      averageSpeed: Math.round(avgSpeed * 100) / 100,
      oeeId: oeeStats?.id,
    };

    let report: ShiftReport;
    if (existingReport) {
      await this.shiftReportRepository.update(existingReport.id, reportData);
      report = await this.shiftReportRepository.findOne({ where: { id: existingReport.id } });
    } else {
      report = this.shiftReportRepository.create(reportData);
      report = await this.shiftReportRepository.save(report);
    }

    return report;
  }

  private async aggregateDowntime(records: DowntimeRecord[]): Promise<Record<string, any>> {
    const reasons = await this.downtimeReasonRepository.find();
    const reasonMap = new Map(reasons.map(r => [r.id, r]));
    
    const breakdown: Record<string, { count: number; duration: number; reasonName: string; category: string }> = {};
    
    for (const record of records) {
      const reason = reasonMap.get(record.reasonId);
      if (!reason) continue;

      if (!breakdown[reason.reasonCode]) {
        breakdown[reason.reasonCode] = {
          count: 0,
          duration: 0,
          reasonName: reason.reasonName,
          category: reason.category,
        };
      }
      
      breakdown[reason.reasonCode].count++;
      breakdown[reason.reasonCode].duration += record.durationMinutes;
    }

    return breakdown;
  }

  private getShiftDateTime(dateStr: string, timeStr: string): Date {
    return moment(`${dateStr} ${timeStr}`).toDate();
  }

  private getShiftEndDateTime(dateStr: string, startTime: string, endTime: string): Date {
    const start = moment(`${dateStr} ${startTime}`);
    const end = moment(`${dateStr} ${endTime}`);
    
    if (end.isBefore(start)) {
      end.add(1, 'day');
    }
    
    return end.toDate();
  }

  async getReports(
    loomId?: number,
    shiftId?: number,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    pageSize: number = 30,
  ): Promise<{ list: ShiftReport[]; total: number }> {
    const where: any = {};
    if (loomId) where.loomId = loomId;
    if (shiftId) where.shiftId = shiftId;
    if (startDate && endDate) {
      where.shiftDate = Between(moment(startDate).toDate(), moment(endDate).toDate()) as any;
    }

    const [list, total] = await this.shiftReportRepository.findAndCount({
      where,
      order: { shiftDate: 'DESC', shiftId: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async getReport(id: number): Promise<ShiftReport> {
    const report = await this.shiftReportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`报表 #${id} 不存在`);
    }
    return report;
  }

  async updateReport(id: number, data: Partial<ShiftReport>): Promise<ShiftReport> {
    await this.getReport(id);
    await this.shiftReportRepository.update(id, data);
    return await this.getReport(id);
  }
}
