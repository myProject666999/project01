import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Voyage, VoyageSupply, InventoryItem, InventoryRecord, VoyageStatus, VoyageSupplyStatus, InventoryRecordType } from '../../entities';
import { CreateVoyageDto, UpdateVoyageDto, AddVoyageSuppliesDto, StockInDto } from '../../dto/voyage.dto';

@Injectable()
export class VoyageService {
  constructor(
    @InjectRepository(Voyage)
    private voyageRepo: Repository<Voyage>,
    @InjectRepository(VoyageSupply)
    private voyageSupplyRepo: Repository<VoyageSupply>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepo: Repository<InventoryItem>,
    @InjectRepository(InventoryRecord)
    private inventoryRecordRepo: Repository<InventoryRecord>,
    private dataSource: DataSource,
  ) {}

  findAll() {
    return this.voyageRepo.find({ relations: ['voyageSupplies'] });
  }

  findOne(id: number) {
    return this.voyageRepo.findOne({ where: { id }, relations: ['voyageSupplies', 'voyageSupplies.supply', 'voyageSupplies.targetWarehouse'] });
  }

  create(dto: CreateVoyageDto) {
    const entity = this.voyageRepo.create(dto);
    return this.voyageRepo.save(entity);
  }

  async update(id: number, dto: UpdateVoyageDto) {
    await this.voyageRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.voyageRepo.delete(id);
    return { deleted: true };
  }

  async addSupplies(voyageId: number, dto: AddVoyageSuppliesDto) {
    const voyage = await this.voyageRepo.findOne({ where: { id: voyageId } });
    if (!voyage) throw new BadRequestException('Voyage not found');
    const entities = dto.supplies.map(s =>
      this.voyageSupplyRepo.create({
        voyageId,
        supplyId: s.supplyId,
        targetWarehouseId: s.targetWarehouseId,
        quantity: s.quantity,
      }),
    );
    return this.voyageSupplyRepo.save(entities);
  }

  async stockIn(voyageId: number, dto: StockInDto) {
    const voyage = await this.voyageRepo.findOne({ where: { id: voyageId } });
    if (!voyage) throw new BadRequestException('Voyage not found');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of dto.items) {
        const vs = await queryRunner.manager.findOne(VoyageSupply, { where: { id: item.voyageSupplyId } });
        if (!vs || vs.voyageId !== voyageId) throw new BadRequestException(`VoyageSupply ${item.voyageSupplyId} not found`);
        if (vs.status === VoyageSupplyStatus.STOCKED_IN) throw new BadRequestException(`VoyageSupply ${item.voyageSupplyId} already stocked in`);

        const actualQty = item.actualQuantity ?? vs.quantity;

        let invItem = await queryRunner.manager.findOne(InventoryItem, {
          where: { supplyId: vs.supplyId, warehouseId: vs.targetWarehouseId },
        });

        if (invItem) {
          invItem.quantity = Number(invItem.quantity) + Number(actualQty);
          invItem.lastStockIn = new Date();
          await queryRunner.manager.save(InventoryItem, invItem);
        } else {
          invItem = queryRunner.manager.create(InventoryItem, {
            supplyId: vs.supplyId,
            warehouseId: vs.targetWarehouseId,
            quantity: actualQty,
            lastStockIn: new Date(),
          });
          await queryRunner.manager.save(InventoryItem, invItem);
        }

        const record = queryRunner.manager.create(InventoryRecord, {
          inventoryItemId: invItem.id,
          type: InventoryRecordType.IN,
          quantity: actualQty,
          sourceType: 'voyage',
          sourceId: vs.id,
        });
        await queryRunner.manager.save(InventoryRecord, record);

        vs.actualQuantity = actualQty;
        vs.status = VoyageSupplyStatus.STOCKED_IN;
        await queryRunner.manager.save(VoyageSupply, vs);
      }

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
