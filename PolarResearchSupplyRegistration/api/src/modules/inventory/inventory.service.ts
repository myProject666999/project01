import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from '../../entities/inventory-item.entity';
import { InventoryRecord } from '../../entities/inventory-record.entity';
import { QueryInventoryDto } from '../../dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepo: Repository<InventoryItem>,
    @InjectRepository(InventoryRecord)
    private recordRepo: Repository<InventoryRecord>,
  ) {}

  async findAll(query: QueryInventoryDto) {
    const qb = this.inventoryRepo.createQueryBuilder('inv')
      .leftJoinAndSelect('inv.supply', 'supply')
      .leftJoinAndSelect('inv.warehouse', 'warehouse')
      .leftJoinAndSelect('supply.category', 'category');

    if (query.warehouseId) {
      qb.andWhere('inv.warehouseId = :warehouseId', { warehouseId: query.warehouseId });
    }
    if (query.categoryId) {
      qb.andWhere('supply.categoryId = :categoryId', { categoryId: query.categoryId });
    }
    if (query.keyword) {
      qb.andWhere('supply.name LIKE :keyword', { keyword: `%${query.keyword}%` });
    }

    return qb.getMany();
  }

  findOne(id: number) {
    return this.inventoryRepo.findOne({ where: { id }, relations: ['supply', 'warehouse', 'supply.category'] });
  }

  getRecords(id: number) {
    return this.recordRepo.find({ where: { inventoryItemId: id }, order: { createdAt: 'DESC' } });
  }
}
