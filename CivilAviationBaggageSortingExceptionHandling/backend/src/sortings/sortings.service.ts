import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SortingPort } from '../entities/sorting-port.entity';
import { SortingRule } from '../entities/sorting-rule.entity';
import { CreateSortingPortDto } from './dto/create-sorting-port.dto';
import { CreateSortingRuleDto } from './dto/create-sorting-rule.dto';

@Injectable()
export class SortingsService {
  constructor(
    @InjectRepository(SortingPort)
    private portRepo: Repository<SortingPort>,
    @InjectRepository(SortingRule)
    private ruleRepo: Repository<SortingRule>,
  ) {}

  async findAllPorts() {
    return this.portRepo.find({ order: { port_code: 'ASC' } });
  }

  async createPort(dto: CreateSortingPortDto) {
    const port = this.portRepo.create(dto);
    return this.portRepo.save(port);
  }

  async findAllRules() {
    return this.ruleRepo.find({
      relations: { sorting_port: true },
      order: { flight_no: 'ASC', effective_start: 'ASC' },
    });
  }

  async createRule(dto: CreateSortingRuleDto) {
    const port = await this.portRepo.findOne({ where: { id: dto.port_id } });
    if (!port) {
      throw new NotFoundException(`分拣口 ID ${dto.port_id} 不存在`);
    }
    const rule = this.ruleRepo.create({
      ...dto,
      priority: dto.priority ?? 0,
    });
    return this.ruleRepo.save(rule);
  }

  async getSortingPortByFlight(flightNo: string, time?: Date) {
    const queryTime = time || new Date();
    const rule = await this.ruleRepo
      .createQueryBuilder('rule')
      .leftJoinAndSelect('rule.sorting_port', 'port')
      .where('rule.flight_no = :flightNo', { flightNo })
      .andWhere('rule.effective_start <= :queryTime', { queryTime })
      .andWhere('rule.effective_end >= :queryTime', { queryTime })
      .orderBy('rule.priority', 'DESC')
      .getOne();

    if (!rule) {
      throw new NotFoundException(
        `航班 ${flightNo} 在当前时段没有对应的分拣口映射`,
      );
    }
    return rule;
  }

  async getActiveRules() {
    const now = new Date();
    return this.ruleRepo
      .createQueryBuilder('rule')
      .leftJoinAndSelect('rule.sorting_port', 'port')
      .where('rule.effective_start <= :now', { now })
      .andWhere('rule.effective_end >= :now', { now })
      .orderBy('rule.priority', 'DESC')
      .getMany();
  }
}
