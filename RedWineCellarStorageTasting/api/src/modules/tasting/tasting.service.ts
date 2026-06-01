import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TastingNote } from '@/entities/tasting-note.entity';
import { CreateTastingNoteDto, UpdateTastingNoteDto } from './dto';

@Injectable()
export class TastingService {
  constructor(
    @InjectRepository(TastingNote)
    private readonly noteRepo: Repository<TastingNote>,
  ) {}

  async create(dto: CreateTastingNoteDto): Promise<TastingNote> {
    const note = this.noteRepo.create({
      wineId: dto.wineId,
      inventoryId: dto.inventoryId,
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

  async findByWine(wineId: number): Promise<TastingNote[]> {
    return this.noteRepo.find({
      where: { wineId },
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
