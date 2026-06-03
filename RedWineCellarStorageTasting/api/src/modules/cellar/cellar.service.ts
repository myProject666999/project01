import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CellarSlot, SlotStatus } from '@/entities/cellar-slot.entity';
import { Inventory, InventoryStatus } from '@/entities/inventory.entity';
import { StockInDto } from './dto';
import { CellarSlotWithWine, CellarLayout } from './types';

@Injectable()
export class CellarService {
  constructor(
    @InjectRepository(CellarSlot)
    private readonly slotRepo: Repository<CellarSlot>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  private calculateSlotStatus(drinkTo: number | null): 'empty' | 'occupied' | 'approaching' | 'overdue' {
    if (drinkTo === null) return 'empty';
    const currentYear = new Date().getFullYear();
    if (drinkTo < currentYear) return 'overdue';
    if (drinkTo <= currentYear + 1) return 'approaching';
    return 'occupied';
  }

  private transformSlot(slot: CellarSlot): CellarSlotWithWine {
    const wine = slot.inventory?.wine;
    const drinkTo = wine?.drinkTo ?? null;
    const status = slot.status === SlotStatus.EMPTY ? 'empty' : this.calculateSlotStatus(drinkTo);

    return {
      id: slot.id,
      rackNo: slot.rackNo,
      layerNo: slot.layerNo,
      positionNo: slot.positionNo,
      status: status as CellarSlotWithWine['status'],
      wineId: wine?.id ?? null,
      wine: wine
        ? {
            chateau: wine.chateau,
            vintage: wine.vintage,
            region: wine.region,
            drinkTo: wine.drinkTo,
          }
        : undefined,
    };
  }

  async getSlots(): Promise<CellarSlotWithWine[]> {
    const slots = await this.slotRepo.find({
      relations: ['inventory', 'inventory.wine'],
      order: { rackNo: 'ASC', layerNo: 'ASC', positionNo: 'ASC' },
    });
    return slots.map((slot) => this.transformSlot(slot));
  }

  async getAvailableSlots(): Promise<CellarSlotWithWine[]> {
    const slots = await this.slotRepo.find({
      where: { status: SlotStatus.EMPTY },
      order: { rackNo: 'ASC', layerNo: 'ASC', positionNo: 'ASC' },
    });
    return slots.map((slot) => this.transformSlot(slot));
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

  async getLayout(): Promise<CellarLayout> {
    const slots = await this.slotRepo.find();
    const rackNos = [...new Set(slots.map((s) => s.rackNo))];
    const layerNos = [...new Set(slots.map((s) => s.layerNo))];
    const positionNos = [...new Set(slots.map((s) => s.positionNo))];

    return {
      totalRacks: rackNos.length,
      layersPerRack: layerNos.length,
      positionsPerLayer: positionNos.length,
    };
  }
}
