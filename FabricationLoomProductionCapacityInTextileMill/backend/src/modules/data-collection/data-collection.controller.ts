import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { DataCollectionService, PlcDataPayload } from './data-collection.service';
import { LoomRealtimeData } from '../../entities/loom-realtime-data.entity';

@Controller('api/data')
export class DataCollectionController {
  constructor(private readonly dataCollectionService: DataCollectionService) {}

  @Post('plc')
  async collectPlcData(@Body() payload: PlcDataPayload): Promise<{ success: boolean; message: string }> {
    return await this.dataCollectionService.collectPlcData(payload);
  }

  @Post('plc/batch')
  async collectBatchPlcData(@Body() payloads: PlcDataPayload[]): Promise<{ success: boolean; results: any[] }> {
    const results = [];
    for (const payload of payloads) {
      const result = await this.dataCollectionService.collectPlcData(payload);
      results.push({ ...payload, ...result });
    }
    return { success: true, results };
  }

  @Get('history/:loomId')
  async getRealtimeHistory(
    @Param('loomId') loomId: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<LoomRealtimeData[]> {
    return await this.dataCollectionService.getRealtimeHistory(
      parseInt(loomId),
      startTime ? new Date(startTime) : null,
      endTime ? new Date(endTime) : null,
    );
  }

  @Post('simulate')
  async simulatePlcData(@Body('loomId') loomId?: string): Promise<{ success: boolean }> {
    await this.dataCollectionService.simulatePlcData(loomId ? parseInt(loomId) : undefined);
    return { success: true };
  }

  @Post('aggregate')
  async triggerAggregation(): Promise<{ success: boolean }> {
    await this.dataCollectionService.aggregateRealtimeData();
    return { success: true };
  }
}
