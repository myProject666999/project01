import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SheetMusic } from '../../entities/sheet-music.entity';
import { User } from '../../entities/user.entity';
import { CreateSheetMusicDto } from './dto/create-sheet-music.dto';
import { UpdateSheetMusicDto } from './dto/update-sheet-music.dto';

@Injectable()
export class SheetMusicService {
  constructor(
    @InjectRepository(SheetMusic)
    private sheetMusicRepository: Repository<SheetMusic>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(publicOnly: boolean = true): Promise<SheetMusic[]> {
    const where = publicOnly ? { isPublic: true } : {};
    return this.sheetMusicRepository.find({
      where,
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: number): Promise<SheetMusic[]> {
    return this.sheetMusicRepository.find({
      where: { uploadedBy: { id: userId } },
      relations: ['uploadedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SheetMusic> {
    const sheetMusic = await this.sheetMusicRepository.findOne({
      where: { id },
      relations: ['uploadedBy', 'lessons'],
    });
    if (!sheetMusic) {
      throw new NotFoundException(`SheetMusic with ID ${id} not found`);
    }
    sheetMusic.viewCount++;
    await this.sheetMusicRepository.save(sheetMusic);
    return sheetMusic;
  }

  async create(createSheetMusicDto: CreateSheetMusicDto): Promise<SheetMusic> {
    const uploadedBy = await this.userRepository.findOne({ where: { id: createSheetMusicDto.uploadedById } });
    if (!uploadedBy) {
      throw new NotFoundException(`User with ID ${createSheetMusicDto.uploadedById} not found`);
    }

    const sheetMusic = this.sheetMusicRepository.create({
      ...createSheetMusicDto,
      uploadedBy,
    });

    return this.sheetMusicRepository.save(sheetMusic);
  }

  async update(id: number, updateSheetMusicDto: UpdateSheetMusicDto): Promise<SheetMusic> {
    const sheetMusic = await this.findOne(id);
    Object.assign(sheetMusic, updateSheetMusicDto);
    return this.sheetMusicRepository.save(sheetMusic);
  }

  async remove(id: number): Promise<void> {
    const result = await this.sheetMusicRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`SheetMusic with ID ${id} not found`);
    }
  }
}
