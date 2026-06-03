import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Stocktaking, StocktakingItem, InventoryItem, StocktakingScopeType, StocktakingStatus } from '../../entities';
import { CreateStocktakingDto, UpdateStocktakingItemDto } from '../../dto/stocktaking.dto';

@Injectable()
export class StocktakingService {
  constructor(
    @InjectRepository(Stocktaking)
    private stocktakingRepo: Repository<Stocktaking>,
    @InjectRepository(StocktakingItem)
    private stocktakingItemRepo: Repository<StocktakingItem>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepo: Repository<InventoryItem>,
    private dataSource: DataSource,
  ) {}

  findAll() {
    return this.stocktakingRepo.find({ relations: ['createdByMember'], order: { createdAt: 'DESC' } });
  }

  findOne(id: number) {
    return this.stocktakingRepo.findOne({
      where: { id },
      relations: ['items', 'items.inventoryItem', 'items.inventoryItem.supply', 'items.inventoryItem.warehouse', 'createdByMember', 'approvedByMember'],
    });
  }

  async create(dto: CreateStocktakingDto) {
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');

    const count = await this.stocktakingRepo.count();
    const seq = String(count + 1).padStart(3, '0');
    const taskNo = `ST-${dateStr}-${seq}`;

    const scopeType = (dto.scopeType as StocktakingScopeType) || StocktakingScopeType.ALL;

    const queryBuilder = this.inventoryItemRepo.createQueryBuilder('inv')
      .leftJoinAndSelect('inv.supply', 'supply')
      .leftJoinAndSelect('inv.warehouse', 'warehouse');

    if (scopeType === StocktakingScopeType.WAREHOUSE && dto.scopeId) {
      queryBuilder.andWhere('inv.warehouseId = :warehouseId', { warehouseId: dto.scopeId });
    } else if (scopeType === StocktakingScopeType.CATEGORY && dto.scopeId) {
      queryBuilder.andWhere('supply.categoryId = :categoryId', { categoryId: dto.scopeId });
    }

    const inventoryItems = await queryBuilder.getMany();

    const stocktaking = this.stocktakingRepo.create({
      taskNo,
      scopeType,
      scopeId: dto.scopeId,
      createdBy: dto.createdBy,
    });
    const saved = await this.stocktakingRepo.save(stocktaking);

    const items = inventoryItems.map(inv =>
      this.stocktakingItemRepo.create({
        stocktakingId: saved.id,
        inventoryItemId: inv.id,
        bookQuantity: Number(inv.quantity),
      }),
    );
    await this.stocktakingItemRepo.save(items);

    return this.findOne(saved.id);
  }

  async updateItem(id: number, itemId: number, dto: UpdateStocktakingItemDto) {
    const item = await this.stocktakingItemRepo.findOne({ where: { id: itemId, stocktakingId: id } });
    if (!item) throw new BadRequestException('Stocktaking item not found');

    item.actualQuantity = dto.actualQuantity;
    item.difference = Number(dto.actualQuantity) - Number(item.bookQuantity);
    if (dto.remark) item.remark = dto.remark;

    await this.stocktakingItemRepo.save(item);
    return item;
  }

  async complete(id: number) {
    const stocktaking = await this.stocktakingRepo.findOne({ where: { id } });
    if (!stocktaking) throw new BadRequestException('Stocktaking not found');

    stocktaking.status = StocktakingStatus.COMPLETED;
    stocktaking.completedAt = new Date();
    await this.stocktakingRepo.save(stocktaking);

    return this.findOne(id);
  }

  async approve(id: number) {
    const stocktaking = await this.stocktakingRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!stocktaking) throw new BadRequestException('Stocktaking not found');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of stocktaking.items) {
        if (item.difference && Number(item.difference) !== 0) {
          const invItem = await queryRunner.manager.findOne(InventoryItem, {
            where: { id: item.inventoryItemId },
          });
          if (invItem) {
            invItem.quantity = Number(invItem.quantity) + Number(item.difference);
            await queryRunner.manager.save(InventoryItem, invItem);
          }
        }
      }

      stocktaking.status = StocktakingStatus.APPROVED;
      stocktaking.approvedAt = new Date();
      await queryRunner.manager.save(Stocktaking, stocktaking);

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
