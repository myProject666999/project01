import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CellarSlot, SlotStatus } from '@/entities/cellar-slot.entity';
import { Inventory, InventoryStatus } from '@/entities/inventory.entity';
import { StockInDto } from './dto';

@Injectable()
export class CellarService {
  constructor(
    @InjectRepository(CellarSlot)
    private readonly slotRepo: Repository<CellarSlot>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  async getSlots(): Promise<CellarSlot[]> {
    return this.slotRepo.find({
      relations: ['inventory', 'inventory.wine'],
      order: { rackNo: 'ASC', layerNo: 'ASC', positionNo: 'ASC' },
    });
  }

  async getAvailableSlots(): Promise<CellarSlot[]> {
    return this.slotRepo.find({
      where: { status: SlotStatus.EMPTY },
      order: { rackNo: 'ASC', layerNo: 'ASC', positionNo: 'ASC' },
    });
  }

  async stockIn(dto: StockInDto): Promise<Inventory> {
    const slot = await this.slotRepo.findOne({ where: { id: dto.slotId } });
    if (!slot) {
      throw new NotFoundException(`Slot #${dto.slotId} not found`);
    }
    if (slot.status === SlotStatus.OCCUPIED) {
      throw new BadRequestException(`Slot #${dto.slotId} is already occupied`);
    }

    slot.status = SlotStatus.OCCUPIED;
    await this.slotRepo.save(slot);

    const inventory = this.inventoryRepo.create({
      wineId: dto.wineId,
      slotId: dto.slotId,
      status: InventoryStatus.IN_CELLAR,
      stockInDate: new Date().toISOString().split('T')[0],
    });
    return this.inventoryRepo.save(inventory);
  }

  async stockOut(id: number): Promise<Inventory> {
    const inventory = await this.inventoryRepo.findOne({ where: { id } });
    if (!inventory) {
      throw new NotFoundException(`Inventory #${id} not found`);
    }
    if (inventory.status === InventoryStatus.OPENED) {
      throw new BadRequestException(`Inventory #${id} is already opened`);
    }

    inventory.status = InventoryStatus.OPENED;
    inventory.openedDate = new Date().toISOString().split('T')[0];
    await this.inventoryRepo.save(inventory);

    const slot = await this.slotRepo.findOne({ where: { id: inventory.slotId } });
    if (slot) {
      slot.status = SlotStatus.EMPTY;
      await this.slotRepo.save(slot);
    }

    return inventory;
  }

  async getLayout(): Promise<Record<number, CellarSlot[]>> {
    const slots = await this.slotRepo.find({
      relations: ['inventory', 'inventory.wine'],
      order: { layerNo: 'ASC', positionNo: 'ASC' },
    });

    const grouped: Record<number, CellarSlot[]> = {};
    for (const slot of slots) {
      if (!grouped[slot.rackNo]) {
        grouped[slot.rackNo] = [];
      }
      grouped[slot.rackNo].push(slot);
    }
    return grouped;
  }
}
