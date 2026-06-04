import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Baggage } from '../entities/baggage.entity';
import { BaggageScanLog } from '../entities/baggage-scan-log.entity';
import { ScanBaggageDto } from './dto/scan-baggage.dto';

@Injectable()
export class BaggagesService {
  constructor(
    @InjectRepository(Baggage)
    private baggageRepo: Repository<Baggage>,
    @InjectRepository(BaggageScanLog)
    private scanLogRepo: Repository<BaggageScanLog>,
    private dataSource: DataSource,
  ) {}

  async findAll(page = 1, limit = 20, status?: string) {
    const qb = this.baggageRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.passenger', 'p')
      .leftJoinAndSelect('b.flight', 'f')
      .orderBy('b.created_at', 'DESC');

    if (status) {
      qb.andWhere('b.status = :status', { status });
    }

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { items, total, page, limit };
  }

  async findByTagCode(tagCode: string) {
    const baggage = await this.baggageRepo.findOne({
      where: { tag_code: tagCode },
      relations: { passenger: true, flight: true, scan_logs: true },
    });
    if (!baggage) {
      throw new NotFoundException(`行李牌号 ${tagCode} 不存在`);
    }
    return baggage;
  }

  async scanBaggage(dto: ScanBaggageDto) {
    const baggage = await this.baggageRepo.findOne({
      where: { tag_code: dto.tag_code },
    });
    if (!baggage) {
      throw new NotFoundException(`行李牌号 ${dto.tag_code} 不存在`);
    }

    const recentScan = await this.scanLogRepo
      .createQueryBuilder('log')
      .where('log.baggage_id = :baggageId', { baggageId: baggage.id })
      .andWhere('log.scan_location = :location', { location: dto.scan_location })
      .andWhere('log.scan_time > :threshold', {
        threshold: new Date(Date.now() - 5 * 60 * 1000),
      })
      .getOne();

    if (recentScan) {
      return {
        message: '重复扫描已忽略（幂等处理）',
        baggage,
        scan_log: recentScan,
        idempotent: true,
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const scanLog = queryRunner.manager.create(BaggageScanLog, {
        baggage_id: baggage.id,
        scan_location: dto.scan_location,
        scan_time: new Date(),
        operator: dto.operator || null,
      });
      await queryRunner.manager.save(BaggageScanLog, scanLog);

      if (dto.scan_location.includes('分拣区') || dto.scan_location.includes('滑槽')) {
        baggage.status = 'SORTED';
        await queryRunner.manager.save(Baggage, baggage);
      } else if (dto.scan_location.includes('装卸区') || dto.scan_location.includes('机坪')) {
        baggage.status = 'LOADED';
        await queryRunner.manager.save(Baggage, baggage);
      }

      await queryRunner.commitTransaction();
      return {
        message: '扫描成功',
        baggage,
        scan_log: scanLog,
        idempotent: false,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getScanLogs(baggageId: number) {
    return this.scanLogRepo.find({
      where: { baggage_id: baggageId },
      order: { scan_time: 'ASC' },
    });
  }
}
