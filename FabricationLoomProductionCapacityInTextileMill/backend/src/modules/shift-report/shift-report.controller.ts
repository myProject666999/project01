import { Controller, Get, Query, Param, Post, Body, Put } from '@nestjs/common';
import { ShiftReportService } from './shift-report.service';
import { ShiftReport } from '../../entities/shift-report.entity';

@Controller('api/shift-reports')
export class ShiftReportController {
  constructor(private readonly shiftReportService: ShiftReportService) {}

  @Get()
  async getReports(
    @Query('loomId') loomId?: string,
    @Query('shiftId') shiftId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '30',
  ): Promise<{ list: ShiftReport[]; total: number }> {
    return await this.shiftReportService.getReports(
      loomId ? parseInt(loomId) : undefined,
      shiftId ? parseInt(shiftId) : undefined,
      startDate,
      endDate,
      parseInt(page),
      parseInt(pageSize),
    );
  }

  @Get(':id')
  async getReport(@Param('id') id: string): Promise<ShiftReport> {
    return await this.shiftReportService.getReport(parseInt(id));
  }

  @Put(':id')
  async updateReport(@Param('id') id: string, @Body() data: Partial<ShiftReport>): Promise<ShiftReport> {
    return await this.shiftReportService.updateReport(parseInt(id), data);
  }

  @Post('generate')
  async generateReport(
    @Body('loomId') loomId: string,
    @Body('shiftId') shiftId: string,
    @Body('shiftDate') shiftDate: string,
  ): Promise<ShiftReport> {
    return await this.shiftReportService.generateReport(
      parseInt(loomId),
      parseInt(shiftId),
      shiftDate,
    );
  }

  @Post('generate-all')
  async generateAllReports(): Promise<{ success: boolean }> {
    await this.shiftReportService.generateShiftReports();
    return { success: true };
  }
}
