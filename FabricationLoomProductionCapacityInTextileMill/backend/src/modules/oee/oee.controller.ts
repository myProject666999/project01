import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { OeeService } from './oee.service';
import { OeeStats } from '../../entities/oee-stats.entity';

@Controller('api/oee')
export class OeeController {
  constructor(private readonly oeeService: OeeService) {}

  @Get()
  async getOeeStats(
    @Query('loomId') loomId?: string,
    @Query('shiftId') shiftId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '30',
  ): Promise<{ list: OeeStats[]; total: number }> {
    return await this.oeeService.getOeeStats(
      loomId ? parseInt(loomId) : undefined,
      shiftId ? parseInt(shiftId) : undefined,
      startDate,
      endDate,
      parseInt(page),
      parseInt(pageSize),
    );
  }

  @Get('summary')
  async getOeeSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('loomId') loomId?: string,
  ): Promise<{
    avgAvailability: number;
    avgPerformance: number;
    avgQuality: number;
    avgOee: number;
    totalOutput: number;
    totalRunningHours: number;
  }> {
    return await this.oeeService.getOeeSummary(
      startDate,
      endDate,
      loomId ? parseInt(loomId) : undefined,
    );
  }

  @Post('calculate')
  async calculateOee(
    @Body('loomId') loomId: string,
    @Body('shiftId') shiftId: string,
    @Body('statDate') statDate: string,
  ): Promise<OeeStats> {
    return await this.oeeService.calculateOee(
      parseInt(loomId),
      parseInt(shiftId),
      statDate,
    );
  }

  @Post('calculate-all')
  async calculateAllOee(): Promise<{ success: boolean }> {
    await this.oeeService.calculateOeeForAllLooms();
    return { success: true };
  }
}
