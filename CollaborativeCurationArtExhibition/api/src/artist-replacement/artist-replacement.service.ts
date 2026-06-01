import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArtistReplacement } from './entities/artist-replacement.entity';
import { Artist } from '../artist/entities/artist.entity';
import { CreateArtistReplacementDto } from './dto/create-artist-replacement.dto';
import { UpdateArtistReplacementDto } from './dto/update-artist-replacement.dto';

@Injectable()
export class ArtistReplacementService {
  constructor(
    @InjectRepository(ArtistReplacement)
    private replacementRepository: Repository<ArtistReplacement>,
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
  ) {}

  async findAll() {
    return this.replacementRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const replacement = await this.replacementRepository.findOne({ where: { id } });
    if (!replacement) {
      throw new NotFoundException(`ArtistReplacement #${id} not found`);
    }
    return replacement;
  }

  async create(createDto: CreateArtistReplacementDto) {
    const originalArtist = await this.artistRepository.findOne({
      where: { id: createDto.originalArtistId },
    });
    if (!originalArtist) {
      throw new NotFoundException('Original artist not found');
    }
    const replacement = this.replacementRepository.create(createDto);
    return this.replacementRepository.save(replacement);
  }

  async update(id: number, updateDto: UpdateArtistReplacementDto) {
    const replacement = await this.findOne(id);
    Object.assign(replacement, updateDto);
    return this.replacementRepository.save(replacement);
  }

  async remove(id: number) {
    const replacement = await this.findOne(id);
    await this.replacementRepository.remove(replacement);
    return { message: 'ArtistReplacement deleted successfully' };
  }

  async approve(id: number) {
    const replacement = await this.findOne(id);
    if (replacement.status !== 'pending') {
      throw new BadRequestException('Only pending replacements can be approved');
    }

    const originalArtist = await this.artistRepository.findOne({
      where: { id: replacement.originalArtistId },
    });
    if (originalArtist) {
      originalArtist.confirmStatus = 'withdrawn';
      await this.artistRepository.save(originalArtist);
    }

    if (replacement.replacementArtistId) {
      const newArtist = await this.artistRepository.findOne({
        where: { id: replacement.replacementArtistId },
      });
      if (newArtist) {
        newArtist.confirmStatus = 'confirmed';
        await this.artistRepository.save(newArtist);
      }
    }

    replacement.status = 'completed';
    return this.replacementRepository.save(replacement);
  }

  async reject(id: number) {
    const replacement = await this.findOne(id);
    if (replacement.status !== 'pending') {
      throw new BadRequestException('Only pending replacements can be rejected');
    }
    replacement.status = 'rejected';
    return this.replacementRepository.save(replacement);
  }
}
