import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TastingNote } from '@/entities/tasting-note.entity';
import { Wine } from '@/entities/wine.entity';
import { Inventory } from '@/entities/inventory.entity';
import { CreateTastingNoteDto, UpdateTastingNoteDto } from './dto';

@Injectable()
export class TastingService {
  constructor(
    @InjectRepository(TastingNote)
    private readonly noteRepo: Repository<TastingNote>,
    @InjectRepository(Wine)
    private readonly wineRepo: Repository<Wine>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  async create(dto: CreateTastingNoteDto): Promise<TastingNote> {
    const wine = await this.wineRepo.findOne({ where: { id: dto.wineId } });
    if (!wine) {
      throw new NotFoundException(`Wine #${dto.wineId} not found`);
    }

    const inventory = await this.inventoryRepo.findOne({ where: { id: dto.inventoryId } });
    if (!inventory) {
      throw new NotFoundException(`Inventory #${dto.inventoryId} not found`);
    }

    const note = this.noteRepo.create({
      wine,
      inventory,
      tastingDate: dto.tastingDate,
      companions: dto.companions,
      appearanceScore: dto.appearanceScore,
      aromaScore: dto.aromaScore,
      tasteScore: dto.tasteScore,
      overallScore: dto.overallScore,
      notes: dto.notes,
    });
    return this.noteRepo.save(note);
  }

  async findAll(): Promise<TastingNote[]> {
    return this.noteRepo.find({
      relations: ['wine', 'inventory'],
      order: { tastingDate: 'DESC' },
    });
  }

  async findByWine(wineId: number): Promise<TastingNote[]> {
    return this.noteRepo.find({
      where: { wineId },
      relations: ['wine', 'inventory'],
      order: { tastingDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<TastingNote> {
    const note = await this.noteRepo.findOne({
      where: { id },
      relations: ['wine', 'inventory'],
    });
    if (!note) {
      throw new NotFoundException(`Tasting note #${id} not found`);
    }
    return note;
  }

  async update(id: number, dto: UpdateTastingNoteDto): Promise<TastingNote> {
    const note = await this.findOne(id);
    Object.assign(note, dto);
    return this.noteRepo.save(note);
  }
}
