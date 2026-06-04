import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loom, LoomStatus } from '../../entities/loom.entity';
import { RedisService, RealtimeData } from '../../services/redis.service';

@Injectable()
export class LoomService {
  constructor(
    @InjectRepository(Loom)
    private readonly loomRepository: Repository<Loom>,
    private readonly redisService: RedisService,
  ) {}

  async findAll(page: number = 1, pageSize: number = 50, status?: LoomStatus): Promise<{ list: Loom[]; total: number }> {
    const where: any = {};
    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await this.loomRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { loomCode: 'ASC' },
    });

    return { list, total };
  }

  async findOne(id: number): Promise<Loom> {
    const loom = await this.loomRepository.findOne({ where: { id } });
    if (!loom) {
      throw new NotFoundException(`织机 #${id} 不存在`);
    }
    return loom;
  }

  async findByCode(loomCode: string): Promise<Loom> {
    const loom = await this.loomRepository.findOne({ where: { loomCode } });
    if (!loom) {
      throw new NotFoundException(`织机 ${loomCode} 不存在`);
    }
    return loom;
  }

  async create(data: Partial<Loom>): Promise<Loom> {
    const loom = this.loomRepository.create(data);
    return await this.loomRepository.save(loom);
  }

  async update(id: number, data: Partial<Loom>): Promise<Loom> {
    await this.findOne(id);
    await this.loomRepository.update(id, data);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.loomRepository.update(id, { status: LoomStatus.DISABLED });
  }

  async updateRunningHours(id: number, hours: number): Promise<void> {
    await this.loomRepository.increment({ id }, 'totalRunningHours', hours);
  }

  async getRealtimeStatus(id: number): Promise<{ loom: Loom; realtime: RealtimeData | null }> {
    const loom = await this.findOne(id);
    const realtime = await this.redisService.getRealtimeData(id);
    return { loom, realtime };
  }

  async getAllRealtimeStatus(): Promise<Array<{ loom: Loom; realtime: RealtimeData | null }>> {
    const { list: looms } = await this.findAll(1, 200, LoomStatus.ENABLED);
    const loomIds = looms.map(l => l.id);
    const realtimeDataList = await this.redisService.getBatchRealtimeData(loomIds);
    
    const realtimeMap = new Map<number, RealtimeData>();
    realtimeDataList.forEach(data => realtimeMap.set(data.loomId, data));

    return looms.map(loom => ({
      loom,
      realtime: realtimeMap.get(loom.id) || null,
    }));
  }

  async getCompatibleLooms(specId: number): Promise<Loom[]> {
    const looms = await this.loomRepository.find({
      where: { status: LoomStatus.ENABLED },
    });
    
    return looms.filter(loom => 
      loom.compatibleSpecs && loom.compatibleSpecs.includes(specId)
    );
  }

  async getAvailableLooms(specId: number): Promise<Loom[]> {
    const compatibleLooms = await this.getCompatibleLooms(specId);
    
    return compatibleLooms;
  }
}
