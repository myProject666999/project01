import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { MaintenanceWorkOrder, WorkOrderStatus } from '../../entities/maintenance-work-order.entity';
import { MaintenancePlan } from '../../entities/maintenance-plan.entity';
import { Loom } from '../../entities/loom.entity';

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    @InjectRepository(MaintenanceWorkOrder)
    private readonly workOrderRepository: Repository<MaintenanceWorkOrder>,
    @InjectRepository(MaintenancePlan)
    private readonly planRepository: Repository<MaintenancePlan>,
    @InjectRepository(Loom)
    private readonly loomRepository: Repository<Loom>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async checkAndGenerateMaintenanceOrders(): Promise<void> {
    this.logger.log('开始检查并生成保养工单...');
    
    try {
      const looms = await this.loomRepository.find({ where: { status: 1 } });
      const plans = await this.planRepository.find();

      for (const loom of looms) {
        for (const plan of plans) {
          await this.checkAndGenerateOrder(loom, plan);
        }
      }
      
      this.logger.log('保养工单检查完成');
    } catch (error) {
      this.logger.error(`保养工单生成失败: ${error.message}`, error.stack);
    }
  }

  private async checkAndGenerateOrder(loom: Loom, plan: MaintenancePlan): Promise<void> {
    const thresholdHours = plan.intervalHours;
    const totalRunningHours = loom.totalRunningHours || 0;
    
    const lastMaintenance = await this.workOrderRepository.findOne({
      where: {
        loomId: loom.id,
        maintenancePlanId: plan.id,
        status: WorkOrderStatus.COMPLETED,
      },
      order: { actualEndDate: 'DESC' },
    });

    const hoursSinceLastMaintenance = lastMaintenance?.actualEndDate
      ? await this.calculateRunningHoursSince(loom.id, lastMaintenance.actualEndDate)
      : totalRunningHours;

    const pendingOrder = await this.workOrderRepository.findOne({
      where: {
        loomId: loom.id,
        maintenancePlanId: plan.id,
        status: In([WorkOrderStatus.PENDING, WorkOrderStatus.IN_PROGRESS]),
      },
    });

    if (pendingOrder) {
      return;
    }

    if (hoursSinceLastMaintenance >= thresholdHours * 0.9) {
      await this.generateWorkOrder(loom, plan, hoursSinceLastMaintenance);
    }
  }

  private async calculateRunningHoursSince(loomId: number, date: Date): Promise<number> {
    const loom = await this.loomRepository.findOne({ where: { id: loomId } });
    if (!loom) return 0;
    return loom.totalRunningHours || 0;
  }

  private async generateWorkOrder(
    loom: Loom,
    plan: MaintenancePlan,
    triggerHours: number,
  ): Promise<MaintenanceWorkOrder> {
    const workOrderNo = this.generateWorkOrderNo();
    
    const workOrder = this.workOrderRepository.create({
      workOrderNo,
      loomId: loom.id,
      maintenancePlanId: plan.id,
      maintenanceType: plan.maintenanceType,
      triggerType: '自动',
      triggerRunningHours: triggerHours,
      scheduledDate: moment().add(1, 'day').toDate(),
      status: WorkOrderStatus.PENDING,
      checkResults: plan.checkItems ? { items: plan.checkItems.map(item => ({ ...item, result: null, remark: '' })) } : undefined,
    });

    const savedOrder = await this.workOrderRepository.save(workOrder);
    
    const nextMaintenanceDate = moment().add(Math.ceil(plan.intervalHours / 20), 'days').toDate();
    await this.loomRepository.update(loom.id, {
      nextMaintenanceDate,
    });

    this.logger.log(`生成保养工单: ${workOrderNo} - 织机 ${loom.loomCode} - ${plan.planName}`);
    
    return savedOrder;
  }

  private generateWorkOrderNo(): string {
    const date = moment().format('YYYYMMDD');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `MO${date}${random}`;
  }

  async createManualOrder(
    loomId: number,
    maintenanceType: string,
    scheduledDate?: string,
    operator?: string,
  ): Promise<MaintenanceWorkOrder> {
    const loom = await this.loomRepository.findOne({ where: { id: loomId } });
    if (!loom) {
      throw new NotFoundException(`织机 #${loomId} 不存在`);
    }

    const workOrderNo = this.generateWorkOrderNo();
    
    const workOrder = this.workOrderRepository.create({
      workOrderNo,
      loomId,
      maintenanceType,
      triggerType: '手动',
      triggerRunningHours: loom.totalRunningHours,
      scheduledDate: scheduledDate ? moment(scheduledDate).toDate() : moment().toDate(),
      status: WorkOrderStatus.PENDING,
      operator,
    });

    return await this.workOrderRepository.save(workOrder);
  }

  async getWorkOrders(
    loomId?: number,
    status?: WorkOrderStatus,
    maintenanceType?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ list: MaintenanceWorkOrder[]; total: number }> {
    const where: any = {};
    if (loomId) where.loomId = loomId;
    if (status !== undefined) where.status = status;
    if (maintenanceType) where.maintenanceType = maintenanceType;
    if (startDate && endDate) {
      where.scheduledDate = Between(moment(startDate).toDate(), moment(endDate).toDate()) as any;
    }

    const [list, total] = await this.workOrderRepository.findAndCount({
      where,
      order: { scheduledDate: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async getWorkOrder(id: number): Promise<MaintenanceWorkOrder> {
    const order = await this.workOrderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`保养工单 #${id} 不存在`);
    }
    return order;
  }

  async updateWorkOrder(id: number, data: Partial<MaintenanceWorkOrder>): Promise<MaintenanceWorkOrder> {
    await this.getWorkOrder(id);
    await this.workOrderRepository.update(id, data);
    return await this.getWorkOrder(id);
  }

  async startWorkOrder(id: number, operator?: string): Promise<MaintenanceWorkOrder> {
    const order = await this.getWorkOrder(id);
    if (order.status !== WorkOrderStatus.PENDING) {
      throw new BadRequestException('工单状态不正确，无法开始');
    }

    await this.workOrderRepository.update(id, {
      status: WorkOrderStatus.IN_PROGRESS,
      actualStartDate: new Date(),
      operator: operator || order.operator,
    });

    return await this.getWorkOrder(id);
  }

  async completeWorkOrder(
    id: number,
    maintenanceContent: string,
    checkResults?: any[],
    replacedParts?: any[],
    remark?: string,
  ): Promise<MaintenanceWorkOrder> {
    const order = await this.getWorkOrder(id);
    if (order.status !== WorkOrderStatus.IN_PROGRESS) {
      throw new BadRequestException('工单状态不正确，无法完成');
    }

    const actualEndDate = new Date();
    
    await this.workOrderRepository.update(id, {
      status: WorkOrderStatus.COMPLETED,
      actualEndDate,
      maintenanceContent,
      checkResults: checkResults ? { items: checkResults } : undefined,
      replacedParts,
      remark,
    });

    const loom = await this.loomRepository.findOne({ where: { id: order.loomId } });
    if (loom && order.maintenancePlanId) {
      const plan = await this.planRepository.findOne({ where: { id: order.maintenancePlanId } });
      if (plan) {
        const nextMaintenanceDate = moment().add(Math.ceil(plan.intervalHours / 20), 'days').toDate();
        await this.loomRepository.update(order.loomId, {
          lastMaintenanceDate: actualEndDate,
          nextMaintenanceDate,
        });
      }
    }

    return await this.getWorkOrder(id);
  }

  async cancelWorkOrder(id: number, remark?: string): Promise<MaintenanceWorkOrder> {
    const order = await this.getWorkOrder(id);
    if (order.status === WorkOrderStatus.COMPLETED) {
      throw new BadRequestException('已完成的工单无法取消');
    }

    await this.workOrderRepository.update(id, {
      status: WorkOrderStatus.CANCELLED,
      remark: remark || order.remark,
    });

    return await this.getWorkOrder(id);
  }

  async getPlans(): Promise<MaintenancePlan[]> {
    return await this.planRepository.find({ order: { intervalHours: 'ASC' } });
  }

  async createPlan(data: Partial<MaintenancePlan>): Promise<MaintenancePlan> {
    const plan = this.planRepository.create(data);
    return await this.planRepository.save(plan);
  }

  async updatePlan(id: number, data: Partial<MaintenancePlan>): Promise<MaintenancePlan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`保养计划 #${id} 不存在`);
    }
    await this.planRepository.update(id, data);
    return await this.planRepository.findOne({ where: { id } });
  }

  async getMaintenanceSummary(
    startDate: string,
    endDate: string,
  ): Promise<{
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    inProgressOrders: number;
    cancelledOrders: number;
    totalMaintenanceHours: number;
    ordersByType: Record<string, number>;
  }> {
    const where: any = {
      createdAt: Between(moment(startDate).toDate(), moment(endDate).toDate()) as any,
    };

    const orders = await this.workOrderRepository.find({ where });

    const summary = {
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === WorkOrderStatus.COMPLETED).length,
      pendingOrders: orders.filter(o => o.status === WorkOrderStatus.PENDING).length,
      inProgressOrders: orders.filter(o => o.status === WorkOrderStatus.IN_PROGRESS).length,
      cancelledOrders: orders.filter(o => o.status === WorkOrderStatus.CANCELLED).length,
      totalMaintenanceHours: 0,
      ordersByType: {} as Record<string, number>,
    };

    for (const order of orders) {
      if (order.actualStartDate && order.actualEndDate) {
        const hours = (order.actualEndDate.getTime() - order.actualStartDate.getTime()) / (1000 * 60 * 60);
        summary.totalMaintenanceHours += hours;
      }

      const type = order.maintenanceType;
      summary.ordersByType[type] = (summary.ordersByType[type] || 0) + 1;
    }

    summary.totalMaintenanceHours = Math.round(summary.totalMaintenanceHours * 100) / 100;

    return summary;
  }

  async getLoomsDueForMaintenance(): Promise<Array<{
    loom: Loom;
    duePlans: Array<{
      plan: MaintenancePlan;
      hoursSinceLast: number;
      threshold: number;
      overdue: boolean;
    }>;
  }>> {
    const looms = await this.loomRepository.find({ where: { status: 1 } });
    const plans = await this.planRepository.find();
    const result = [];

    for (const loom of looms) {
      const duePlans = [];
      
      for (const plan of plans) {
        const lastMaintenance = await this.workOrderRepository.findOne({
          where: {
            loomId: loom.id,
            maintenancePlanId: plan.id,
            status: WorkOrderStatus.COMPLETED,
          },
          order: { actualEndDate: 'DESC' },
        });

        const hoursSinceLast = lastMaintenance?.actualEndDate
          ? await this.calculateRunningHoursSince(loom.id, lastMaintenance.actualEndDate)
          : loom.totalRunningHours || 0;

        const threshold = plan.intervalHours;
        const overdue = hoursSinceLast >= threshold;

        if (hoursSinceLast >= threshold * 0.8) {
          duePlans.push({
            plan,
            hoursSinceLast: Math.round(hoursSinceLast * 100) / 100,
            threshold,
            overdue,
          });
        }
      }

      if (duePlans.length > 0) {
        result.push({ loom, duePlans });
      }
    }

    return result.sort((a, b) => {
      const aOverdue = a.duePlans.some(p => p.overdue);
      const bOverdue = b.duePlans.some(p => p.overdue);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return 0;
    });
  }
}
