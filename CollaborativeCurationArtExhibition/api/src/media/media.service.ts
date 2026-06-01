import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaItem } from './entities/media-item.entity';
import { MediaVersion } from './entities/media-version.entity';
import { CreateMediaItemDto } from './dto/create-media-item.dto';
import { UpdateMediaItemDto } from './dto/update-media-item.dto';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaItem)
    private mediaItemRepository: Repository<MediaItem>,
    @InjectRepository(MediaVersion)
    private mediaVersionRepository: Repository<MediaVersion>,
  ) {}

  async findAll() {
    return this.mediaItemRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findByExhibition(exhibitionId: number) {
    return this.mediaItemRepository.find({
      where: { exhibitionId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const mediaItem = await this.mediaItemRepository.findOne({ where: { id } });
    if (!mediaItem) {
      throw new NotFoundException(`MediaItem #${id} not found`);
    }
    return mediaItem;
  }

  async create(createMediaItemDto: CreateMediaItemDto) {
    const mediaItem = this.mediaItemRepository.create(createMediaItemDto);
    return this.mediaItemRepository.save(mediaItem);
  }

  async update(id: number, updateMediaItemDto: UpdateMediaItemDto) {
    const mediaItem = await this.findOne(id);
    Object.assign(mediaItem, updateMediaItemDto);
    return this.mediaItemRepository.save(mediaItem);
  }

  async remove(id: number) {
    const mediaItem = await this.findOne(id);
    await this.mediaItemRepository.remove(mediaItem);
    return { message: 'MediaItem deleted successfully' };
  }

  async getVersions(mediaItemId: number) {
    await this.findOne(mediaItemId);
    return this.mediaVersionRepository.find({
      where: { mediaItemId },
      order: { versionNumber: 'DESC' },
    });
  }

  async addVersion(mediaItemId: number, file: Express.Multer.File, uploadedBy?: string) {
    const mediaItem = await this.findOne(mediaItemId);
    mediaItem.currentVersion += 1;
    await this.mediaItemRepository.save(mediaItem);

    const version = this.mediaVersionRepository.create({
      mediaItemId,
      versionNumber: mediaItem.currentVersion,
      fileUrl: file.filename,
      fileName: file.originalname,
      uploadedBy,
    });
    return this.mediaVersionRepository.save(version);
  }
}
