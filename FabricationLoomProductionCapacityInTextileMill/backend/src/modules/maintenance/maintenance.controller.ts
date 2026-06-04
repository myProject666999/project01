import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceWorkOrder, WorkOrderStatus } from '../../entities/maintenance-work-order.entity';
import { MaintenancePlan } from '../../entities/maintenance-plan.entity';

@Controller('api/maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get('plans')
  async getPlans(): Promise<MaintenancePlan[]> {
    return await this.maintenanceService.getPlans();
  }

  @Post('plans')
  async createPlan(@Body() data: Partial<MaintenancePlan>): Promise<MaintenancePlan> {
    return await this.maintenanceService.createPlan(data);
  }

  @Put('plans/:id')
  async updatePlan(
    @Param('id') id: string,
    @Body() data: Partial<MaintenancePlan>,
  ): Promise<MaintenancePlan> {
    return await this.maintenanceService.updatePlan(parseInt(id), data);
  }

  @Get('orders')
  async getWorkOrders(
    @Query('loomId') loomId?: string,
    @Query('status') status?: string,
    @Query('maintenanceType') maintenanceType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ): Promise<{ list: MaintenanceWorkOrder[]; total: number }> {
    return await this.maintenanceService.getWorkOrders(
      loomId ? parseInt(loomId) : undefined,
      status !== undefined ? parseInt(status) as WorkOrderStatus : undefined,
      maintenanceType,
      startDate,
      endDate,
      parseInt(page),
      parseInt(pageSize),
    );
  }

  @Get('orders/:id')
  async getWorkOrder(@Param('id') id: string): Promise<MaintenanceWorkOrder> {
    return await this.maintenanceService.getWorkOrder(parseInt(id));
  }

  @Post('orders')
  async createManualOrder(
    @Body('loomId') loomId: string,
    @Body('maintenanceType') maintenanceType: string,
    @Body('scheduledDate') scheduledDate?: string,
    @Body('operator') operator?: string,
  ): Promise<MaintenanceWorkOrder> {
    return await this.maintenanceService.createManualOrder(
      parseInt(loomId),
      maintenanceType,
      scheduledDate,
      operator,
    );
  }

  @Put('orders/:id')
  async updateWorkOrder(
    @Param('id') id: string,
    @Body() data: Partial<MaintenanceWorkOrder>,
  ): Promise<MaintenanceWorkOrder> {
    return await this.maintenanceService.updateWorkOrder(parseInt(id), data);
  }

  @Post('orders/:id/start')
  async startWorkOrder(
    @Param('id') id: string,
    @Body('operator') operator?: string,
  ): Promise<MaintenanceWorkOrder> {
    return await this.maintenanceService.startWorkOrder(parseInt(id), operator);
  }

  @Post('orders/:id/complete')
  async completeWorkOrder(
    @Param('id') id: string,
    @Body('maintenanceContent') maintenanceContent: string,
    @Body('checkResults') checkResults?: any[],
    @Body('replacedParts') replacedParts?: any[],
    @Body('remark') remark?: string,
  ): Promise<MaintenanceWorkOrder> {
    return await this.maintenanceService.completeWorkOrder(
      parseInt(id),
      maintenanceContent,
      checkResults,
      replacedParts,
      remark,
    );
  }

  @Post('orders/:id/cancel')
  async cancelWorkOrder(
    @Param('id') id: string,
    @Body('remark') remark?: string,
  ): Promise<MaintenanceWorkOrder> {
    return await this.maintenanceService.cancelWorkOrder(parseInt(id), remark);
  }

  @Post('check')
  async checkAndGenerateOrders(): Promise<{ success: boolean }> {
    await this.maintenanceService.checkAndGenerateMaintenanceOrders();
    return { success: true };
  }

  @Get('summary')
  async getMaintenanceSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<{
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    inProgressOrders: number;
    cancelledOrders: number;
    totalMaintenanceHours: number;
    ordersByType: Record<string, number>;
  }> {
    return await this.maintenanceService.getMaintenanceSummary(startDate, endDate);
  }

  @Get('due')
  async getLoomsDueForMaintenance(): Promise<Array<{
    loom: any;
    duePlans: Array<{
      plan: MaintenancePlan;
      hoursSinceLast: number;
      threshold: number;
      overdue: boolean;
    }>;
  }>> {
    return await this.maintenanceService.getLoomsDueForMaintenance();
  }
}
