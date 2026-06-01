import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory, InventoryStatus } from '@/entities/inventory.entity';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  async getDrinkWindowAlerts() {
    const currentYear = 2026;

    const inCellarInventories = await this.inventoryRepo.find({
      where: { status: InventoryStatus.IN_CELLAR },
      relations: ['wine'],
    });

    const wineMap = new Map<
      number,
      {
        wineId: number;
        chateau: string;
        vintage: number;
        region: string;
        drinkFrom: number;
        drinkTo: number;
        bottleCount: number;
      }
    >();

    for (const inv of inCellarInventories) {
      const wineId = inv.wineId;
      if (!wineMap.has(wineId)) {
        wineMap.set(wineId, {
          wineId,
          chateau: inv.wine.chateau,
          vintage: inv.wine.vintage,
          region: inv.wine.region,
          drinkFrom: inv.wine.drinkFrom,
          drinkTo: inv.wine.drinkTo,
          bottleCount: 0,
        });
      }
      wineMap.get(wineId)!.bottleCount++;
    }

    return Array.from(wineMap.values()).map((entry, index) => {
      const drinkTo = entry.drinkTo;
      let urgency: string;

      if (drinkTo > currentYear + 3) {
        urgency = 'safe';
      } else if (drinkTo <= currentYear + 3 && drinkTo > currentYear + 1) {
        urgency = 'approaching';
      } else if (drinkTo <= currentYear + 1 && drinkTo >= currentYear) {
        urgency = 'urgent';
      } else {
        urgency = 'overdue';
      }

      const remainingYears = drinkTo - currentYear;

      return {
        id: index + 1,
        wineId: entry.wineId,
        chateau: entry.chateau,
        vintage: entry.vintage,
        region: entry.region,
        drinkFrom: entry.drinkFrom,
        drinkTo: entry.drinkTo,
        bottleCount: entry.bottleCount,
        urgency,
        remainingYears,
      };
    });
  }
}
