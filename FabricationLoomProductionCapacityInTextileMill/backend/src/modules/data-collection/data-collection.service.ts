import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoomRealtimeData } from '../../entities/loom-realtime-data.entity';
import { RedisService, RealtimeData } from '../../services/redis.service';
import { LoomService } from '../loom/loom.service';

export interface PlcDataPayload {
  loomCode: string;
  meterage: number;
  runningStatus: number;
  speed: number;
  defectiveMeters: number;
  timestamp?: string;
}

@Injectable()
export class DataCollectionService {
  private readonly logger = new Logger(DataCollectionService.name);
  private lastMeterageMap = new Map<number, number>();

  constructor(
    @InjectRepository(LoomRealtimeData)
    private readonly realtimeDataRepository: Repository<LoomRealtimeData>,
    private readonly redisService: RedisService,
    private readonly loomService: LoomService,
  ) {}

  async collectPlcData(payload: PlcDataPayload): Promise<{ success: boolean; message: string }> {
    try {
      const loom = await this.loomService.findByCode(payload.loomCode);
      const timestamp = payload.timestamp || new Date().toISOString();
      
      const lastMeterage = this.lastMeterageMap.get(loom.id) || 0;
      const incrementalMeters = Math.max(0, payload.meterage - lastMeterage);
      this.lastMeterageMap.set(loom.id, payload.meterage);

      const realtimeData: Omit<RealtimeData, 'loomId'> = {
        loomCode: payload.loomCode,
        timestamp,
        meterage: payload.meterage,
        incrementalMeters,
        runningStatus: payload.runningStatus,
        speed: payload.speed,
        defectiveMeters: payload.defectiveMeters,
      };

      await this.redisService.writeRealtimeData(loom.id, realtimeData);

      return { success: true, message: '数据写入Redis成功' };
    } catch (error) {
      this.logger.error(`PLC数据采集失败: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async aggregateRealtimeData(): Promise<void> {
    this.logger.log('开始聚合实时数据到MySQL...');
    
    try {
      const { list: looms } = await this.loomService.findAll(1, 200);
      
      for (const loom of looms) {
        const buffer = await this.redisService.getRealtimeBuffer(loom.id, 60);
        if (buffer.length === 0) continue;

        const aggregatedData = this.aggregateBuffer(buffer, loom.id);
        if (aggregatedData.totalOutput > 0) {
          await this.saveAggregatedData(aggregatedData);
          await this.loomService.updateRunningHours(loom.id, aggregatedData.runningHours);
        }

        await this.redisService.clearBuffer(loom.id);
      }
      
      this.logger.log('实时数据聚合完成');
    } catch (error) {
      this.logger.error(`实时数据聚合失败: ${error.message}`, error.stack);
    }
  }

  private aggregateBuffer(buffer: RealtimeData[], loomId: number): {
    loomId: number;
    timestamp: Date;
    totalOutput: number;
    defectiveOutput: number;
    avgSpeed: number;
    runningHours: number;
    runningStatus: number;
  } {
    const totalOutput = buffer.reduce((sum, d) => sum + d.incrementalMeters, 0);
    const defectiveOutput = buffer.reduce((sum, d) => sum + d.defectiveMeters, 0);
    const speedSum = buffer.reduce((sum, d) => sum + d.speed, 0);
    const avgSpeed = buffer.length > 0 ? speedSum / buffer.length : 0;
    
    const runningCount = buffer.filter(d => d.runningStatus === 1).length;
    const runningHours = runningCount / 3600;
    
    const lastStatus = buffer[0]?.runningStatus || 2;

    return {
      loomId,
      timestamp: new Date(),
      totalOutput,
      defectiveOutput,
      avgSpeed,
      runningHours,
      runningStatus: lastStatus,
    };
  }

  private async saveAggregatedData(data: {
    loomId: number;
    timestamp: Date;
    totalOutput: number;
    defectiveOutput: number;
    avgSpeed: number;
    runningHours: number;
    runningStatus: number;
  }): Promise<void> {
    const record = this.realtimeDataRepository.create({
      loomId: data.loomId,
      timestamp: data.timestamp,
      meterage: 0,
      incrementalMeters: data.totalOutput,
      runningStatus: data.runningStatus,
      speed: Math.round(data.avgSpeed),
      defectiveMeters: data.defectiveOutput,
    });

    await this.realtimeDataRepository.save(record);
  }

  async getRealtimeHistory(loomId: number, startTime: Date, endTime: Date): Promise<LoomRealtimeData[]> {
    return await this.realtimeDataRepository.find({
      where: {
        loomId,
        timestamp: startTime && endTime ? { between: [startTime, endTime] } as any : undefined,
      },
      order: { timestamp: 'DESC' },
      take: 1000,
    });
  }

  async simulatePlcData(loomId?: number): Promise<void> {
    const { list: looms } = await this.loomService.findAll(1, 200);
    const targetLooms = loomId ? looms.filter(l => l.id === loomId) : looms;

    for (const loom of targetLooms.slice(0, 10)) {
      const lastMeterage = this.lastMeterageMap.get(loom.id) || Math.random() * 1000;
      const status = Math.random() > 0.1 ? 1 : (Math.random() > 0.5 ? 2 : 3);
      
      await this.collectPlcData({
        loomCode: loom.loomCode,
        meterage: lastMeterage + Math.random() * 0.1,
        runningStatus: status,
        speed: status === 1 ? Math.round(500 + Math.random() * 200) : 0,
        defectiveMeters: Math.random() > 0.95 ? 0.1 : 0,
      });
    }
  }
}
