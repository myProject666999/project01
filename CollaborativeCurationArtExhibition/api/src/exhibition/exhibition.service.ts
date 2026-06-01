import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exhibition } from './entities/exhibition.entity';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';

@Injectable()
export class ExhibitionService {
  constructor(
    @InjectRepository(Exhibition)
    private exhibitionRepository: Repository<Exhibition>,
  ) {}

  async findAll() {
    return this.exhibitionRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const exhibition = await this.exhibitionRepository.findOne({ where: { id } });
    if (!exhibition) {
      throw new NotFoundException(`Exhibition #${id} not found`);
    }
    return exhibition;
  }

  async create(createExhibitionDto: CreateExhibitionDto) {
    const exhibition = this.exhibitionRepository.create(createExhibitionDto);
    return this.exhibitionRepository.save(exhibition);
  }

  async update(id: number, updateExhibitionDto: UpdateExhibitionDto) {
    const exhibition = await this.findOne(id);
    Object.assign(exhibition, updateExhibitionDto);
    return this.exhibitionRepository.save(exhibition);
  }

  async remove(id: number) {
    const exhibition = await this.findOne(id);
    await this.exhibitionRepository.remove(exhibition);
    return { message: 'Exhibition deleted successfully' };
  }
}
