import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Wine } from '@/entities/wine.entity';
import { GrapeVariety } from '@/entities/grape-variety.entity';
import { Inventory, InventoryStatus } from '@/entities/inventory.entity';
import { CreateWineDto, UpdateWineDto } from './dto';

@Injectable()
export class WineService {
  constructor(
    @InjectRepository(Wine)
    private readonly wineRepo: Repository<Wine>,
    @InjectRepository(GrapeVariety)
    private readonly grapeVarietyRepo: Repository<GrapeVariety>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  async create(dto: CreateWineDto): Promise<Wine> {
    const wine = this.wineRepo.create({
      region: dto.region,
      chateau: dto.chateau,
      vintage: dto.vintage,
      abv: dto.abv,
      drinkFrom: dto.drinkFrom,
      drinkTo: dto.drinkTo,
      purchasePrice: dto.purchasePrice,
      marketPrice: dto.marketPrice,
      grapeVarieties: dto.grapeVarieties.map((gv) =>
        this.grapeVarietyRepo.create({
          name: gv.name,
          percentage: gv.percentage,
        }),
      ),
    });
    const saved = await this.wineRepo.save(wine);
    return this.findOne(saved.id);
  }

  async findAll(filters: {
    region?: string;
    chateau?: string;
    vintage?: string;
    keyword?: string;
  }): Promise<any[]> {
    const qb = this.wineRepo
      .createQueryBuilder('wine')
      .leftJoinAndSelect('wine.grapeVarieties', 'gv')
      .leftJoin(
        'wine.inventories',
        'inv',
        'inv.status = :inCellar',
        { inCellar: InventoryStatus.IN_CELLAR },
      )
      .addSelect('COUNT(inv.id)', 'bottleCount')
      .groupBy('wine.id')
      .addGroupBy('gv.id');

    if (filters.region) {
      qb.andWhere('wine.region = :region', { region: filters.region });
    }
    if (filters.chateau) {
      qb.andWhere('wine.chateau = :chateau', { chateau: filters.chateau });
    }
    if (filters.vintage) {
      qb.andWhere('wine.vintage = :vintage', { vintage: Number(filters.vintage) });
    }
    if (filters.keyword) {
      qb.andWhere('(wine.region LIKE :kw OR wine.chateau LIKE :kw)', {
        kw: `%${filters.keyword}%`,
      });
    }

    qb.orderBy('wine.created_at', 'DESC');

    const rawResults = await qb.getRawAndEntities();
    const entities = rawResults.entities;
    const raw = rawResults.raw;

    return entities.map((wine, index) => ({
      ...wine,
      bottleCount: Number(raw[index].bottleCount) || 0,
    }));
  }

  async findOne(id: number): Promise<Wine> {
    const wine = await this.wineRepo.findOne({
      where: { id },
      relations: ['grapeVarieties', 'inventories', 'inventories.slot', 'tastingNotes'],
    });
    if (!wine) {
      throw new NotFoundException(`Wine #${id} not found`);
    }
    return wine;
  }

  async update(id: number, dto: UpdateWineDto): Promise<Wine> {
    const wine = await this.findOne(id);

    if (dto.grapeVarieties !== undefined) {
      wine.grapeVarieties = dto.grapeVarieties.map((gv) =>
        this.grapeVarietyRepo.create({
          name: gv.name,
          percentage: gv.percentage,
        }),
      );
    }

    const updateData: Partial<Wine> = {};
    if (dto.region !== undefined) updateData.region = dto.region;
    if (dto.chateau !== undefined) updateData.chateau = dto.chateau;
    if (dto.vintage !== undefined) updateData.vintage = dto.vintage;
    if (dto.abv !== undefined) updateData.abv = dto.abv;
    if (dto.drinkFrom !== undefined) updateData.drinkFrom = dto.drinkFrom;
    if (dto.drinkTo !== undefined) updateData.drinkTo = dto.drinkTo;
    if (dto.purchasePrice !== undefined) updateData.purchasePrice = dto.purchasePrice;
    if (dto.marketPrice !== undefined) updateData.marketPrice = dto.marketPrice;

    Object.assign(wine, updateData);
    await this.wineRepo.save(wine);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const wine = await this.findOne(id);
    await this.wineRepo.remove(wine);
  }
}
