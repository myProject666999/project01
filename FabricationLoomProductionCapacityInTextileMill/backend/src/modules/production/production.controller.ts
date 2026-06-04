import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ProductionService, ScheduleRecommendation } from './production.service';
import { ProductionOrder, OrderStatus, UrgencyLevel } from '../../entities/production-order.entity';
import { ProductionSchedule, ScheduleStatus } from '../../entities/production-schedule.entity';
import { LoomExecutionQueue } from '../../entities/loom-execution-queue.entity';

@Controller('api/production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post('orders')
  async createOrder(@Body() data: Partial<ProductionOrder>): Promise<ProductionOrder> {
    return await this.productionService.createOrder(data);
  }

  @Get('orders')
  async getOrders(
    @Query('status') status?: string,
    @Query('urgency') urgency?: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ): Promise<{ list: ProductionOrder[]; total: number }> {
    return await this.productionService.getOrders(
      status !== undefined ? parseInt(status) as OrderStatus : undefined,
      urgency !== undefined ? parseInt(urgency) as UrgencyLevel : undefined,
      parseInt(page),
      parseInt(pageSize),
    );
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string): Promise<ProductionOrder> {
    return await this.productionService.getOrder(parseInt(id));
  }

  @Put('orders/:id')
  async updateOrder(@Param('id') id: string, @Body() data: Partial<ProductionOrder>): Promise<ProductionOrder> {
    return await this.productionService.updateOrder(parseInt(id), data);
  }

  @Get('orders/:id/recommendations')
  async getScheduleRecommendations(@Param('id') orderId: string): Promise<ScheduleRecommendation[]> {
    return await this.productionService.getScheduleRecommendations(parseInt(orderId));
  }

  @Post('orders/:id/schedule')
  async scheduleOrder(
    @Param('id') orderId: string,
    @Body('loomIds') loomIds: number[],
  ): Promise<ProductionSchedule[]> {
    return await this.productionService.scheduleOrder(parseInt(orderId), loomIds);
  }

  @Get('schedules')
  async getSchedules(
    @Query('orderId') orderId?: string,
    @Query('loomId') loomId?: string,
    @Query('status') status?: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '30',
  ): Promise<{ list: ProductionSchedule[]; total: number }> {
    return await this.productionService.getSchedules(
      orderId ? parseInt(orderId) : undefined,
      loomId ? parseInt(loomId) : undefined,
      status !== undefined ? parseInt(status) as ScheduleStatus : undefined,
      parseInt(page),
      parseInt(pageSize),
    );
  }

  @Put('schedules/:id/progress')
  async updateScheduleProgress(
    @Param('id') scheduleId: string,
    @Body('completedLength') completedLength: number,
  ): Promise<ProductionSchedule> {
    return await this.productionService.updateScheduleProgress(
      parseInt(scheduleId),
      completedLength,
    );
  }

  @Get('queues')
  async getAllQueues(): Promise<Array<{ loom: any; queue: LoomExecutionQueue[] }>> {
    return await this.productionService.getAllQueues();
  }

  @Get('queues/:loomId')
  async getLoomQueue(@Param('loomId') loomId: string): Promise<LoomExecutionQueue[]> {
    return await this.productionService.getLoomQueue(parseInt(loomId));
  }
}
