import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as moment from 'moment';
import { ProductionOrder, OrderStatus, UrgencyLevel } from '../../entities/production-order.entity';
import { ProductionSchedule, ScheduleStatus } from '../../entities/production-schedule.entity';
import { LoomExecutionQueue, QueueStatus } from '../../entities/loom-execution-queue.entity';
import { Loom, LoomStatus } from '../../entities/loom.entity';
import { FabricSpec } from '../../entities/fabric-spec.entity';

export interface ScheduleRecommendation {
  loomId: number;
  loomCode: string;
  estimatedDays: number;
  estimatedEndDate: Date;
  queueLength: number;
  priority: number;
}

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);

  constructor(
    @InjectRepository(ProductionOrder)
    private readonly orderRepository: Repository<ProductionOrder>,
    @InjectRepository(ProductionSchedule)
    private readonly scheduleRepository: Repository<ProductionSchedule>,
    @InjectRepository(LoomExecutionQueue)
    private readonly queueRepository: Repository<LoomExecutionQueue>,
    @InjectRepository(Loom)
    private readonly loomRepository: Repository<Loom>,
    @InjectRepository(FabricSpec)
    private readonly specRepository: Repository<FabricSpec>,
  ) {}

  async createOrder(data: Partial<ProductionOrder>): Promise<ProductionOrder> {
    const orderNo = data.orderNo || this.generateOrderNo();
    
    const order = this.orderRepository.create({
      ...data,
      orderNo,
      status: OrderStatus.PENDING_SCHEDULE,
    });

    return await this.orderRepository.save(order);
  }

  private generateOrderNo(): string {
    const date = moment().format('YYYYMMDD');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `PO${date}${random}`;
  }

  async getOrders(
    status?: OrderStatus,
    urgency?: UrgencyLevel,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ list: ProductionOrder[]; total: number }> {
    const where: any = {};
    if (status !== undefined) where.status = status;
    if (urgency !== undefined) where.urgency = urgency;

    const [list, total] = await this.orderRepository.findAndCount({
      where,
      order: { priority: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async getOrder(id: number): Promise<ProductionOrder> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`订单 #${id} 不存在`);
    }
    return order;
  }

  async updateOrder(id: number, data: Partial<ProductionOrder>): Promise<ProductionOrder> {
    await this.getOrder(id);
    await this.orderRepository.update(id, data);
    return await this.getOrder(id);
  }

  async getScheduleRecommendations(orderId: number): Promise<ScheduleRecommendation[]> {
    const order = await this.getOrder(orderId);
    if (order.status !== OrderStatus.PENDING_SCHEDULE) {
      throw new BadRequestException('订单已排产或已取消');
    }

    const spec = await this.specRepository.findOne({ where: { id: order.fabricSpecId } });
    if (!spec) {
      throw new NotFoundException('布料规格不存在');
    }

    const compatibleLooms = await this.loomRepository.find({
      where: { status: LoomStatus.ENABLED },
    });

    const availableLooms = compatibleLooms.filter(loom => 
      loom.compatibleSpecs && loom.compatibleSpecs.includes(order.fabricSpecId)
    );

    const recommendations: ScheduleRecommendation[] = [];

    for (const loom of availableLooms) {
      const queue = await this.queueRepository.find({
        where: { loomId: loom.id, status: QueueStatus.WAITING },
        order: { position: 'ASC' },
      });

      const currentProduction = await this.queueRepository.findOne({
        where: { loomId: loom.id, status: QueueStatus.CURRENT },
        relations: ['scheduleId'],
      });

      let queueWaitLength = 0;
      for (const item of queue) {
        queueWaitLength += item.targetLength;
      }

      const dailyCapacity = loom.ratedCapacity * 20;
      const estimatedDays = (order.totalLength + queueWaitLength) / dailyCapacity;
      const estimatedEndDate = moment().add(Math.ceil(estimatedDays), 'days').toDate();

      const priority = this.calculatePriority(
        order.urgency,
        queue.length,
        estimatedDays,
        order.deliveryDate,
      );

      recommendations.push({
        loomId: loom.id,
        loomCode: loom.loomCode,
        estimatedDays: Math.round(estimatedDays * 100) / 100,
        estimatedEndDate,
        queueLength: queue.length,
        priority,
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  private calculatePriority(
    urgency: UrgencyLevel,
    queueLength: number,
    estimatedDays: number,
    deliveryDate?: Date,
  ): number {
    let priority = 0;
    
    priority += urgency * 100;
    priority -= queueLength * 10;
    priority -= estimatedDays * 5;

    if (deliveryDate) {
      const daysToDelivery = moment(deliveryDate).diff(moment(), 'days');
      if (daysToDelivery < estimatedDays) {
        priority += (estimatedDays - daysToDelivery) * 20;
      }
    }

    return priority;
  }

  async scheduleOrder(orderId: number, loomIds: number[]): Promise<ProductionSchedule[]> {
    const order = await this.getOrder(orderId);
    if (order.status !== OrderStatus.PENDING_SCHEDULE) {
      throw new BadRequestException('订单已排产或已取消');
    }

    const schedules: ProductionSchedule[] = [];
    const lengthPerLoom = order.totalLength / loomIds.length;

    for (let i = 0; i < loomIds.length; i++) {
      const loomId = loomIds[i];
      const loom = await this.loomRepository.findOne({ where: { id: loomId } });
      
      if (!loom) {
        throw new NotFoundException(`织机 #${loomId} 不存在`);
      }

      if (!loom.compatibleSpecs || !loom.compatibleSpecs.includes(order.fabricSpecId)) {
        throw new BadRequestException(`织机 ${loom.loomCode} 不支持该布料规格`);
      }

      const scheduledLength = i === loomIds.length - 1
        ? order.totalLength - lengthPerLoom * (loomIds.length - 1)
        : lengthPerLoom;

      const dailyCapacity = loom.ratedCapacity * 20;
      const estimatedDays = Math.ceil(scheduledLength / dailyCapacity);

      const existingQueue = await this.queueRepository.find({
        where: { loomId, status: QueueStatus.WAITING },
      });

      const schedule = this.scheduleRepository.create({
        orderId,
        loomId,
        scheduledLength: Math.round(scheduledLength * 100) / 100,
        scheduledStartDate: moment().toDate(),
        scheduledEndDate: moment().add(estimatedDays, 'days').toDate(),
        status: ScheduleStatus.PENDING,
        queuePosition: existingQueue.length + 1,
      });

      const savedSchedule = await this.scheduleRepository.save(schedule);
      schedules.push(savedSchedule);

      await this.addToQueue(loomId, savedSchedule.id, orderId, order.fabricSpecId, scheduledLength);
    }

    await this.orderRepository.update(orderId, { status: OrderStatus.IN_PRODUCTION });

    return schedules;
  }

  private async addToQueue(
    loomId: number,
    scheduleId: number,
    orderId: number,
    fabricSpecId: number,
    targetLength: number,
  ): Promise<LoomExecutionQueue> {
    const existingQueue = await this.queueRepository.find({
      where: { loomId, status: QueueStatus.WAITING },
    });

    const currentCount = await this.queueRepository.count({
      where: { loomId, status: QueueStatus.CURRENT },
    });

    const queueItem = this.queueRepository.create({
      loomId,
      scheduleId,
      orderId,
      fabricSpecId,
      targetLength,
      position: currentCount > 0 ? existingQueue.length + 1 : 0,
      status: currentCount > 0 ? QueueStatus.WAITING : QueueStatus.CURRENT,
    });

    return await this.queueRepository.save(queueItem);
  }

  async getLoomQueue(loomId: number): Promise<LoomExecutionQueue[]> {
    return await this.queueRepository.find({
      where: { loomId },
      order: { status: 'ASC', position: 'ASC' },
    });
  }

  async getAllQueues(): Promise<Array<{ loom: Loom; queue: LoomExecutionQueue[] }>> {
    const looms = await this.loomRepository.find({ where: { status: LoomStatus.ENABLED } });
    const result = [];

    for (const loom of looms) {
      const queue = await this.getLoomQueue(loom.id);
      result.push({ loom, queue });
    }

    return result;
  }

  async getSchedules(
    orderId?: number,
    loomId?: number,
    status?: ScheduleStatus,
    page: number = 1,
    pageSize: number = 30,
  ): Promise<{ list: ProductionSchedule[]; total: number }> {
    const where: any = {};
    if (orderId) where.orderId = orderId;
    if (loomId) where.loomId = loomId;
    if (status !== undefined) where.status = status;

    const [list, total] = await this.scheduleRepository.findAndCount({
      where,
      order: { scheduledStartDate: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { list, total };
  }

  async updateScheduleProgress(scheduleId: number, completedLength: number): Promise<ProductionSchedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id: scheduleId } });
    if (!schedule) {
      throw new NotFoundException(`排产计划 #${scheduleId} 不存在`);
    }

    const newCompletedLength = Math.min(completedLength, schedule.scheduledLength);
    
    await this.scheduleRepository.update(scheduleId, {
      completedLength: newCompletedLength,
      status: newCompletedLength >= schedule.scheduledLength 
        ? ScheduleStatus.COMPLETED 
        : ScheduleStatus.IN_PRODUCTION,
      actualStartDate: schedule.actualStartDate || new Date(),
      actualEndDate: newCompletedLength >= schedule.scheduledLength ? new Date() : null,
    });

    if (newCompletedLength >= schedule.scheduledLength) {
      await this.completeSchedule(scheduleId);
    }

    return await this.scheduleRepository.findOne({ where: { id: scheduleId } });
  }

  private async completeSchedule(scheduleId: number): Promise<void> {
    const queueItem = await this.queueRepository.findOne({
      where: { scheduleId, status: QueueStatus.CURRENT },
    });

    if (queueItem) {
      await this.queueRepository.update(queueItem.id, { status: QueueStatus.COMPLETED });
      
      const nextItem = await this.queueRepository.findOne({
        where: { loomId: queueItem.loomId, status: QueueStatus.WAITING },
        order: { position: 'ASC' },
      });

      if (nextItem) {
        await this.queueRepository.update(nextItem.id, { status: QueueStatus.CURRENT, position: 0 });
        
        await this.scheduleRepository.update(nextItem.scheduleId, {
          status: ScheduleStatus.IN_PRODUCTION,
          actualStartDate: new Date(),
        });
      }
    }

    const schedule = await this.scheduleRepository.findOne({ where: { id: scheduleId } });
    const allSchedules = await this.scheduleRepository.find({
      where: { orderId: schedule.orderId },
    });

    const allCompleted = allSchedules.every(s => s.status === ScheduleStatus.COMPLETED);
    if (allCompleted) {
      await this.orderRepository.update(schedule.orderId, { status: OrderStatus.COMPLETED });
    }
  }
}
