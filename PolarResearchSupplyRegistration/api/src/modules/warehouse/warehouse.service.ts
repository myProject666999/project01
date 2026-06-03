import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../../entities/warehouse.entity';
import { CreateWarehouseDto, UpdateWarehouseDto } from '../../dto/warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepo: Repository<Warehouse>,
  ) {}

  findAll() {
    return this.warehouseRepo.find();
  }

  findOne(id: number) {
    return this.warehouseRepo.findOne({ where: { id } });
  }

  create(dto: CreateWarehouseDto) {
    const entity = this.warehouseRepo.create(dto);
    return this.warehouseRepo.save(entity);
  }

  async update(id: number, dto: UpdateWarehouseDto) {
    await this.warehouseRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.warehouseRepo.delete(id);
    return { deleted: true };
  }
}
