import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artwork } from './entities/artwork.entity';
import { ArtworkStatusLog } from './entities/artwork-status-log.entity';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { UpdateArtworkStatusDto } from './dto/update-artwork-status.dto';
import { BatchStatusDto } from './dto/batch-status.dto';

@Injectable()
export class ArtworkService {
  constructor(
    @InjectRepository(Artwork)
    private artworkRepository: Repository<Artwork>,
    @InjectRepository(ArtworkStatusLog)
    private statusLogRepository: Repository<ArtworkStatusLog>,
  ) {}

  async findAll() {
    return this.artworkRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findByExhibition(exhibitionId: number) {
    return this.artworkRepository.find({
      where: { exhibitionId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const artwork = await this.artworkRepository.findOne({ where: { id } });
    if (!artwork) {
      throw new NotFoundException(`Artwork #${id} not found`);
    }
    return artwork;
  }

  async create(createArtworkDto: CreateArtworkDto) {
    const artwork = this.artworkRepository.create(createArtworkDto);
    return this.artworkRepository.save(artwork);
  }

  async update(id: number, updateArtworkDto: UpdateArtworkDto) {
    const artwork = await this.findOne(id);
    Object.assign(artwork, updateArtworkDto);
    return this.artworkRepository.save(artwork);
  }

  async remove(id: number) {
    const artwork = await this.findOne(id);
    await this.artworkRepository.remove(artwork);
    return { message: 'Artwork deleted successfully' };
  }

  async updateStatus(id: number, updateStatusDto: UpdateArtworkStatusDto) {
    const artwork = await this.findOne(id);
    const previousStatus = artwork.transportStatus;
    artwork.transportStatus = updateStatusDto.transportStatus;
    await this.artworkRepository.save(artwork);

    const statusLog = this.statusLogRepository.create({
      artworkId: artwork.id,
      fromStatus: previousStatus,
      toStatus: updateStatusDto.transportStatus,
      operator: updateStatusDto.operator,
      remark: updateStatusDto.remark || `Status changed from ${previousStatus} to ${updateStatusDto.transportStatus}`,
    });
    await this.statusLogRepository.save(statusLog);

    return artwork;
  }

  async batchStatus(batchStatusDto: BatchStatusDto) {
    const results = [];
    for (const item of batchStatusDto.items) {
      const artwork = await this.artworkRepository.findOne({ where: { id: item.id } });
      if (artwork) {
        const previousStatus = artwork.transportStatus;
        artwork.transportStatus = item.transportStatus;
        await this.artworkRepository.save(artwork);

        const statusLog = this.statusLogRepository.create({
          artworkId: artwork.id,
          fromStatus: previousStatus,
          toStatus: item.transportStatus,
          operator: batchStatusDto.operator,
          remark: item.remark || `Status changed from ${previousStatus} to ${item.transportStatus}`,
        });
        await this.statusLogRepository.save(statusLog);
        results.push(artwork);
      }
    }
    return results;
  }
}
