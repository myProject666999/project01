import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { DowntimeService } from './downtime.service';
import { DowntimeRecord } from '../../entities/downtime-record.entity';
import { DowntimeReason } from '../../entities/downtime-reason.entity';

@Controller('api/downtime')
export class DowntimeController {
  constructor(private readonly downtimeService: DowntimeService) {}

  @Get('reasons')
  async getReasons(): Promise<DowntimeReason[]> {
    return await this.downtimeService.getReasons();
  }

  @Post('reasons')
  async createReason(@Body() data: Partial<DowntimeReason>): Promise<DowntimeReason> {
    return await this.downtimeService.createReason(data);
  }

  @Get('records')
  async getRecords(
    @Query('loomId') loomId?: string,
    @Query('reasonId') reasonId?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '50',
  ): Promise<{ list: DowntimeRecord[]; total: number }> {
    return await this.downtimeService.getRecords(
      loomId ? parseInt(loomId) : undefined,
      reasonId ? parseInt(reasonId) : undefined,
      category,
      startDate,
      endDate,
      parseInt(page),
      parseInt(pageSize),
    );
  }

  @Get('records/:id')
  async getRecord(@Param('id') id: string): Promise<DowntimeRecord> {
    return await this.downtimeService.getRecord(parseInt(id));
  }

  @Post('records/start')
  async startDowntime(
    @Body('loomId') loomId: string,
    @Body('reasonId') reasonId: string,
    @Body('operator') operator?: string,
    @Body('remark') remark?: string,
  ): Promise<DowntimeRecord> {
    return await this.downtimeService.startDowntime(
      parseInt(loomId),
      parseInt(reasonId),
      operator,
      remark,
    );
  }

  @Post('records/:id/end')
  async endDowntime(
    @Param('id') id: string,
    @Body('remark') remark?: string,
  ): Promise<DowntimeRecord> {
    return await this.downtimeService.endDowntime(parseInt(id), remark);
  }

  @Put('records/:id')
  async updateRecord(
    @Param('id') id: string,
    @Body() data: Partial<DowntimeRecord>,
  ): Promise<DowntimeRecord> {
    return await this.downtimeService.updateRecord(parseInt(id), data);
  }

  @Get('summary')
  async getDowntimeSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('loomId') loomId?: string,
  ): Promise<{
    totalDowntimeMinutes: number;
    totalDowntimeCount: number;
    downtimeByCategory: Record<string, { minutes: number; count: number }>;
    downtimeByReason: Record<string, { minutes: number; count: number; reasonName: string }>;
    topReasons: Array<{ reasonId: number; reasonName: string; minutes: number; count: number }>;
  }> {
    return await this.downtimeService.getDowntimeSummary(
      startDate,
      endDate,
      loomId ? parseInt(loomId) : undefined,
    );
  }
}
