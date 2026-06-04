import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { OeeStats } from '../../entities/oee-stats.entity';
import { LoomRealtimeData } from '../../entities/loom-realtime-data.entity';
import { DowntimeRecord } from '../../entities/downtime-record.entity';
import { Shift } from '../../entities/shift.entity';
import { Loom } from '../../entities/loom.entity';

@Injectable()
export class OeeService {
  private readonly logger = new Logger(OeeService.name);

  constructor(
    @InjectRepository(OeeStats)
    private readonly oeeStatsRepository: Repository<OeeStats>,
    @InjectRepository(LoomRealtimeData)
    private readonly realtimeDataRepository: Repository<LoomRealtimeData>,
    @InjectRepository(DowntimeRecord)
    private readonly downtimeRepository: Repository<DowntimeRecord>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(Loom)
    private readonly loomRepository: Repository<Loom>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async calculateOeeForAllLooms(): Promise<void> {
    this.logger.log('开始计算OEE...');
    
    try {
      const shifts = await this.shiftRepository.find();
      const looms = await this.loomRepository.find({ where: { status: 1 } });
      const today = moment().format('YYYY-MM-DD');

      for (const loom of looms) {
        for (const shift of shifts) {
          await this.calculateOee(loom.id, shift.id, today);
        }
      }
      
      this.logger.log('OEE计算完成');
    } catch (error) {
      this.logger.error(`OEE计算失败: ${error.message}`, error.stack);
    }
  }

  async calculateOee(loomId: number, shiftId: number, statDate: string): Promise<OeeStats> {
    const shift = await this.shiftRepository.findOne({ where: { id: shiftId } });
    const loom = await this.loomRepository.findOne({ where: { id: loomId } });
    
    if (!shift || !loom) {
      throw new Error('班次或织机不存在');
    }

    const date = moment(statDate);
    const shiftStart = this.getShiftDateTime(statDate, shift.startTime);
    const shiftEnd = this.getShiftEndDateTime(statDate, shift.startTime, shift.endTime);

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
    });

    const plannedProductionTime = shift.plannedHours * 60;
    const actualRunningTime = this.calculateRunningTime(realtimeData);
    const downtime = this.calculateDowntime(downtimeRecords);
    
    const totalOutput = realtimeData.reduce((sum, d) => sum + d.incrementalMeters, 0);
    const defectiveOutput = realtimeData.reduce((sum, d) => sum + d.defectiveMeters, 0);
    const goodOutput = totalOutput - defectiveOutput;

    const availabilityRate = plannedProductionTime > 0 
      ? (actualRunningTime / plannedProductionTime) * 100 
      : 0;

    const theoreticalOutput = (actualRunningTime / 60) * loom.ratedCapacity;
    const performanceRate = theoreticalOutput > 0 
      ? (totalOutput / theoreticalOutput) * 100 
      : 0;

    const qualityRate = totalOutput > 0 
      ? (goodOutput / totalOutput) * 100 
      : 0;

    const oee = (availabilityRate / 100) * (performanceRate / 100) * (qualityRate / 100) * 100;

    const existingStats = await this.oeeStatsRepository.findOne({
      where: { loomId, shiftId, statDate: date.toDate() },
    });

    const statsData: Partial<OeeStats> = {
      loomId,
      shiftId,
      statDate: date.toDate(),
      plannedProductionTime: Math.round(plannedProductionTime),
      actualRunningTime: Math.round(actualRunningTime),
      downtime: Math.round(downtime),
      totalOutput,
      goodOutput,
      defectiveOutput,
      availabilityRate: Math.round(availabilityRate * 100) / 100,
      performanceRate: Math.round(performanceRate * 100) / 100,
      qualityRate: Math.round(qualityRate * 100) / 100,
      oee: Math.round(oee * 100) / 100,
    };

    let stats: OeeStats;
    if (existingStats) {
      await this.oeeStatsRepository.update(existingStats.id, statsData);
      stats = await this.oeeStatsRepository.findOne({ where: { id: existingStats.id } });
    } else {
      stats = this.oeeStatsRepository.create(statsData);
      stats = await this.oeeStatsRepository.save(stats);
    }

    return stats;
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

  private calculateRunningTime(realtimeData: LoomRealtimeData[]): number {
    if (realtimeData.length < 2) return 0;
    
    let runningSeconds = 0;
    for (let i = 1; i < realtimeData.length; i++) {
      const prev = realtimeData[i - 1];
      const curr = realtimeData[i];
      const interval = (curr.timestamp.getTime() - prev.timestamp.getTime()) / 1000;
      
      if (prev.runningStatus === 1) {
        runningSeconds += interval;
      }
    }
    
    return runningSeconds / 60;
  }

  private calculateDowntime(downtimeRecords: DowntimeRecord[]): number {
    return downtimeRecords.reduce((sum, d) => sum + d.durationMinutes, 0);
  }

  async getOeeStats(
    loomId?: number,
    shiftId?: number,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    pageSize: number = 30,
  ): Promise<{ list: OeeStats[]; total: number }> {
    const where: any = {};
    if (loomId) where.loomId = loomId;
    if (shiftId) where.shiftId = shiftId;
    if (startDate && endDate) {
      where.statDate = Between(moment(startDate).toDate(), moment(endDate).toDate()) as any;
    }

    const [list, total] = await this.oeeStatsRepository.findAndCount({
      where,
      order: { statDate: 'DESC', shiftId: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async getOeeSummary(
    startDate: string,
    endDate: string,
    loomId?: number,
  ): Promise<{
    avgAvailability: number;
    avgPerformance: number;
    avgQuality: number;
    avgOee: number;
    totalOutput: number;
    totalRunningHours: number;
  }> {
    const where: any = {
      statDate: Between(moment(startDate).toDate(), moment(endDate).toDate()) as any,
    };
    if (loomId) where.loomId = loomId;

    const stats = await this.oeeStatsRepository.find({ where });

    if (stats.length === 0) {
      return {
        avgAvailability: 0,
        avgPerformance: 0,
        avgQuality: 0,
        avgOee: 0,
        totalOutput: 0,
        totalRunningHours: 0,
      };
    }

    const avgAvailability = stats.reduce((sum, s) => sum + (s.availabilityRate || 0), 0) / stats.length;
    const avgPerformance = stats.reduce((sum, s) => sum + (s.performanceRate || 0), 0) / stats.length;
    const avgQuality = stats.reduce((sum, s) => sum + (s.qualityRate || 0), 0) / stats.length;
    const avgOee = stats.reduce((sum, s) => sum + (s.oee || 0), 0) / stats.length;
    const totalOutput = stats.reduce((sum, s) => sum + s.totalOutput, 0);
    const totalRunningHours = stats.reduce((sum, s) => sum + s.actualRunningTime, 0) / 60;

    return {
      avgAvailability: Math.round(avgAvailability * 100) / 100,
      avgPerformance: Math.round(avgPerformance * 100) / 100,
      avgQuality: Math.round(avgQuality * 100) / 100,
      avgOee: Math.round(avgOee * 100) / 100,
      totalOutput: Math.round(totalOutput * 100) / 100,
      totalRunningHours: Math.round(totalRunningHours * 100) / 100,
    };
  }
}
