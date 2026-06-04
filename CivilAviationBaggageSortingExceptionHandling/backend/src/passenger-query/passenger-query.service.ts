import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Baggage } from '../entities/baggage.entity';
import { BaggageScanLog } from '../entities/baggage-scan-log.entity';
import { ExceptionOrder } from '../entities/exception-order.entity';
import { PassengerNotification } from '../entities/passenger-notification.entity';
import { PassengerQueryDto } from './dto/passenger-query.dto';

const STATUS_LABELS: Record<string, string> = {
  CHECKED_IN: '已值机',
  SORTED: '已分拣',
  LOADED: '已装机',
  DELIVERED: '已到达',
  MISROUTED: '错运中',
  DELAYED: '迟到中',
  DAMAGED: '已破损',
  LOST: '丢失中',
};

@Injectable()
export class PassengerQueryService {
  constructor(
    @InjectRepository(Baggage)
    private baggageRepo: Repository<Baggage>,
    @InjectRepository(BaggageScanLog)
    private scanLogRepo: Repository<BaggageScanLog>,
    @InjectRepository(ExceptionOrder)
    private exceptionRepo: Repository<ExceptionOrder>,
    @InjectRepository(PassengerNotification)
    private notificationRepo: Repository<PassengerNotification>,
  ) {}

  async queryBaggage(dto: PassengerQueryDto) {
    const baggage = await this.baggageRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.passenger', 'p')
      .leftJoinAndSelect('b.flight', 'f')
      .where('b.tag_code = :tagCode', { tagCode: dto.tag_code })
      .andWhere('p.name = :name', { name: dto.name })
      .getOne();

    if (!baggage) {
      throw new NotFoundException('未找到匹配的行李信息，请检查姓名和行李牌号');
    }

    const scanLogs = await this.scanLogRepo.find({
      where: { baggage_id: baggage.id },
      order: { scan_time: 'ASC' },
    });

    const exceptionOrders = await this.exceptionRepo.find({
      where: { baggage_id: baggage.id },
      order: { created_at: 'DESC' },
    });

    const notifications = await this.notificationRepo.find({
      where: { passenger_id: baggage.passenger_id },
      order: { sent_at: 'DESC' },
    });

    const lastScan = scanLogs.length > 0 ? scanLogs[scanLogs.length - 1] : null;

    return {
      tag_code: baggage.tag_code,
      status: baggage.status,
      status_label: STATUS_LABELS[baggage.status] || baggage.status,
      weight: baggage.weight,
      passenger: {
        name: baggage.passenger.name,
        phone: baggage.passenger.phone,
      },
      flight: {
        flight_no: baggage.flight.flight_no,
        departure_city: baggage.flight.departure_city,
        arrival_city: baggage.flight.arrival_city,
        scheduled_departure: baggage.flight.scheduled_departure,
        scheduled_arrival: baggage.flight.scheduled_arrival,
      },
      last_location: lastScan ? lastScan.scan_location : '暂无位置信息',
      last_scan_time: lastScan ? lastScan.scan_time : null,
      scan_trace: scanLogs.map((log) => ({
        location: log.scan_location,
        time: log.scan_time,
        operator: log.operator,
      })),
      exceptions: exceptionOrders.map((ex) => ({
        type: ex.exception_type,
        status: ex.status,
        description: ex.description,
        sla_deadline: ex.sla_deadline,
        created_at: ex.created_at,
      })),
      notifications: notifications.map((n) => ({
        content: n.content,
        sent_at: n.sent_at,
      })),
    };
  }
}
