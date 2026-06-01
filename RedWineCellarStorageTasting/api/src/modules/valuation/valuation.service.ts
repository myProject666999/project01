import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wine } from '@/entities/wine.entity';
import { Inventory, InventoryStatus } from '@/entities/inventory.entity';
import { UpdateMarketPriceDto } from './dto';

@Injectable()
export class ValuationService {
  constructor(
    @InjectRepository(Wine)
    private readonly wineRepo: Repository<Wine>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  async getSummary() {
    const inventories = await this.inventoryRepo.find({
      where: { status: InventoryStatus.IN_CELLAR },
      relations: ['wine'],
    });

    let totalBottles = 0;
    let totalPurchaseCost = 0;
    let totalMarketValue = 0;

    for (const inv of inventories) {
      totalBottles++;
      totalPurchaseCost += Number(inv.wine.purchasePrice);
      if (inv.wine.marketPrice !== null) {
        totalMarketValue += Number(inv.wine.marketPrice);
      }
    }

    const appreciationRate =
      totalPurchaseCost > 0
        ? Number((((totalMarketValue - totalPurchaseCost) / totalPurchaseCost) * 100).toFixed(2))
        : 0;

    return {
      totalBottles,
      totalPurchaseCost: Number(totalPurchaseCost.toFixed(2)),
      totalMarketValue: Number(totalMarketValue.toFixed(2)),
      appreciationRate,
    };
  }

  async getDetails() {
    const inventories = await this.inventoryRepo.find({
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
        purchasePrice: number;
        marketPrice: number;
        bottleCount: number;
        totalPurchaseCost: number;
        totalMarketValue: number;
      }
    >();

    for (const inv of inventories) {
      const wineId = inv.wineId;
      if (!wineMap.has(wineId)) {
        wineMap.set(wineId, {
          wineId,
          chateau: inv.wine.chateau,
          vintage: inv.wine.vintage,
          region: inv.wine.region,
          purchasePrice: Number(inv.wine.purchasePrice),
          marketPrice: inv.wine.marketPrice !== null ? Number(inv.wine.marketPrice) : 0,
          bottleCount: 0,
          totalPurchaseCost: 0,
          totalMarketValue: 0,
        });
      }
      const entry = wineMap.get(wineId)!;
      entry.bottleCount++;
      entry.totalPurchaseCost += Number(inv.wine.purchasePrice);
      if (inv.wine.marketPrice !== null) {
        entry.totalMarketValue += Number(inv.wine.marketPrice);
      }
    }

    return Array.from(wineMap.values()).map((entry) => {
      const appreciationRate =
        entry.totalPurchaseCost > 0
          ? Number((((entry.totalMarketValue - entry.totalPurchaseCost) / entry.totalPurchaseCost) * 100).toFixed(2))
          : 0;

      return {
        wineId: entry.wineId,
        chateau: entry.chateau,
        vintage: entry.vintage,
        region: entry.region,
        bottleCount: entry.bottleCount,
        purchasePrice: Number(entry.purchasePrice.toFixed(2)),
        marketPrice: Number(entry.marketPrice.toFixed(2)),
        totalPurchaseCost: Number(entry.totalPurchaseCost.toFixed(2)),
        totalMarketValue: Number(entry.totalMarketValue.toFixed(2)),
        appreciationRate,
      };
    });
  }

  async updateMarketPrice(wineId: number, dto: UpdateMarketPriceDto) {
    const wine = await this.wineRepo.findOne({ where: { id: wineId } });
    if (!wine) {
      throw new NotFoundException(`Wine #${wineId} not found`);
    }

    wine.marketPrice = dto.marketPrice;
    await this.wineRepo.save(wine);
    return wine;
  }
}
