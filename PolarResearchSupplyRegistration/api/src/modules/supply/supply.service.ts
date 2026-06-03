import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supply } from '../../entities/supply.entity';
import { CreateSupplyDto, UpdateSupplyDto } from '../../dto/supply.dto';

@Injectable()
export class SupplyService {
  constructor(
    @InjectRepository(Supply)
    private supplyRepo: Repository<Supply>,
  ) {}

  findAll() {
    return this.supplyRepo.find({ relations: ['category'] });
  }

  findOne(id: number) {
    return this.supplyRepo.findOne({ where: { id }, relations: ['category'] });
  }

  create(dto: CreateSupplyDto) {
    const entity = this.supplyRepo.create(dto);
    return this.supplyRepo.save(entity);
  }

  async update(id: number, dto: UpdateSupplyDto) {
    await this.supplyRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.supplyRepo.delete(id);
    return { deleted: true };
  }
}
