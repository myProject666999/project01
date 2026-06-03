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

  async findAll(): Promise<SheetMusic[]> {
    return this.sheetMusicRepository.find({
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCreator(userId: number): Promise<SheetMusic[]> {
    return this.sheetMusicRepository.find({
      where: { uploader: { id: userId } },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SheetMusic> {
    const sheetMusic = await this.sheetMusicRepository.findOne({
      where: { id },
      relations: ['uploader', 'lessons'],
    });
    if (!sheetMusic) {
      throw new NotFoundException(`SheetMusic with ID ${id} not found`);
    }
    return sheetMusic;
  }

  async create(createSheetMusicDto: CreateSheetMusicDto): Promise<SheetMusic> {
    const uploader = await this.userRepository.findOne({ where: { id: createSheetMusicDto.createdById } });
    if (!uploader) {
      throw new NotFoundException(`User with ID ${createSheetMusicDto.createdById} not found`);
    }

    const sheetMusic = this.sheetMusicRepository.create({
      title: createSheetMusicDto.title,
      composer: createSheetMusicDto.composer,
      difficultyLevel: createSheetMusicDto.difficultyLevel,
      fileType: createSheetMusicDto.fileType,
      fileUrl: createSheetMusicDto.fileUrl,
      thumbnailUrl: createSheetMusicDto.thumbnailUrl,
      pageCount: createSheetMusicDto.pageCount,
      description: createSheetMusicDto.description,
      uploader,
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
