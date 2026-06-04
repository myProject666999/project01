import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ExceptionOrder, ExceptionType, ExceptionStatus } from '../entities/exception-order.entity';
import { Baggage } from '../entities/baggage.entity';
import { PassengerNotification } from '../entities/passenger-notification.entity';
import { CreateExceptionOrderDto } from './dto/create-exception-order.dto';
import { UpdateExceptionOrderDto } from './dto/update-exception-order.dto';

const SLA_HOURS: Record<string, number> = {
  MISROUTED: 2,
  DELAYED: 4,
  DAMAGED: 6,
  LOST: 24,
};

const EXCEPTION_LABELS: Record<string, string> = {
  MISROUTED: '错运',
  DELAYED: '迟到',
  DAMAGED: '破损',
  LOST: '丢失',
};

@Injectable()
export class ExceptionsService {
  constructor(
    @InjectRepository(ExceptionOrder)
    private exceptionRepo: Repository<ExceptionOrder>,
    @InjectRepository(Baggage)
    private baggageRepo: Repository<Baggage>,
    @InjectRepository(PassengerNotification)
    private notificationRepo: Repository<PassengerNotification>,
    private dataSource: DataSource,
  ) {}

  async findAll(page = 1, limit = 20, status?: string, exceptionType?: string) {
    const qb = this.exceptionRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.baggage', 'b')
      .leftJoinAndSelect('b.passenger', 'p')
      .leftJoinAndSelect('b.flight', 'f')
      .orderBy('e.created_at', 'DESC');

    if (status) {
      qb.andWhere('e.status = :status', { status });
    }
    if (exceptionType) {
      qb.andWhere('e.exception_type = :exceptionType', { exceptionType });
    }

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const now = new Date();
    const result = items.map((item) => ({
      ...item,
      sla_remaining_ms: item.sla_deadline
        ? Math.max(0, new Date(item.sla_deadline).getTime() - now.getTime())
        : null,
      sla_expired: item.sla_deadline
        ? new Date(item.sla_deadline) < now && item.status !== 'RESOLVED' && item.status !== 'CLOSED'
        : false,
    }));

    return { items: result, total, page, limit };
  }

  async findOne(id: number) {
    const order = await this.exceptionRepo.findOne({
      where: { id },
      relations: { baggage: { passenger: true, flight: true } },
    });
    if (!order) {
      throw new NotFoundException(`异常工单 ${id} 不存在`);
    }
    const now = new Date();
    return {
      ...order,
      sla_remaining_ms: order.sla_deadline
        ? Math.max(0, new Date(order.sla_deadline).getTime() - now.getTime())
        : null,
      sla_expired: order.sla_deadline
        ? new Date(order.sla_deadline) < now && order.status !== 'RESOLVED' && order.status !== 'CLOSED'
        : false,
    };
  }

  async create(dto: CreateExceptionOrderDto) {
    const baggage = await this.baggageRepo.findOne({
      where: { id: dto.baggage_id },
      relations: { passenger: true },
    });
    if (!baggage) {
      throw new NotFoundException(`行李 ID ${dto.baggage_id} 不存在`);
    }

    const slaHours = SLA_HOURS[dto.exception_type] || 4;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = queryRunner.manager.create(ExceptionOrder, {
        baggage_id: dto.baggage_id,
        exception_type: dto.exception_type,
        status: ExceptionStatus.PENDING,
        description: dto.description || null,
        sla_deadline: slaDeadline,
      });
      await queryRunner.manager.save(ExceptionOrder, order);

      const statusMap: Record<string, string> = {
        MISROUTED: 'MISROUTED',
        DELAYED: 'DELAYED',
        DAMAGED: 'DAMAGED',
        LOST: 'LOST',
      };
      baggage.status = statusMap[dto.exception_type] || baggage.status;
      await queryRunner.manager.save(Baggage, baggage);

      const label = EXCEPTION_LABELS[dto.exception_type] || dto.exception_type;
      const notification = queryRunner.manager.create(PassengerNotification, {
        passenger_id: baggage.passenger_id,
        exception_order_id: order.id,
        content: `尊敬的${baggage.passenger.name}先生/女士，您的行李（牌号${baggage.tag_code}）出现${label}情况，我们正在紧急处理中，预计${slaHours}小时内解决。`,
        status: 'SENT',
      });
      await queryRunner.manager.save(PassengerNotification, notification);

      await queryRunner.commitTransaction();
      return { order, notification };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, dto: UpdateExceptionOrderDto) {
    const order = await this.exceptionRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`异常工单 ${id} 不存在`);
    }

    if (dto.status) {
      order.status = dto.status;
    }
    if (dto.handler) {
      order.handler = dto.handler;
    }
    if (dto.resolution) {
      order.resolution = dto.resolution;
    }

    if (dto.status === 'RESOLVED' || dto.status === 'CLOSED') {
      order.resolved_at = new Date();

      if (dto.status === 'RESOLVED') {
        const baggage = await this.baggageRepo.findOne({
          where: { id: order.baggage_id },
          relations: { passenger: true },
        });
        if (baggage) {
          baggage.status = 'DELIVERED';
          await this.baggageRepo.save(baggage);

          const label = EXCEPTION_LABELS[order.exception_type] || order.exception_type;
          await this.notificationRepo.save({
            passenger_id: baggage.passenger_id,
            exception_order_id: order.id,
            content: `尊敬的${baggage.passenger.name}先生/女士，您的行李（牌号${baggage.tag_code}）${label}问题已解决，请查收。`,
            status: 'SENT',
          });
        }
      }
    }

    return this.exceptionRepo.save(order);
  }

  async getSlaWarnings() {
    const now = new Date();
    const warningThreshold = new Date(Date.now() + 30 * 60 * 1000);
    return this.exceptionRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.baggage', 'b')
      .leftJoinAndSelect('b.passenger', 'p')
      .where('e.status IN (:...statuses)', { statuses: ['PENDING', 'PROCESSING'] })
      .andWhere('e.sla_deadline IS NOT NULL')
      .andWhere('e.sla_deadline <= :warningThreshold', { warningThreshold })
      .orderBy('e.sla_deadline', 'ASC')
      .getMany();
  }
}
