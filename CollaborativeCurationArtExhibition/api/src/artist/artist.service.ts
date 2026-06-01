import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './entities/artist.entity';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Injectable()
export class ArtistService {
  constructor(
    @InjectRepository(Artist)
    private artistRepository: Repository<Artist>,
  ) {}

  async findAll() {
    return this.artistRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findByExhibition(exhibitionId: number) {
    return this.artistRepository.find({
      where: { exhibitionId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const artist = await this.artistRepository.findOne({ where: { id } });
    if (!artist) {
      throw new NotFoundException(`Artist #${id} not found`);
    }
    return artist;
  }

  async create(createArtistDto: CreateArtistDto) {
    const artist = this.artistRepository.create(createArtistDto);
    return this.artistRepository.save(artist);
  }

  async update(id: number, updateArtistDto: UpdateArtistDto) {
    const artist = await this.findOne(id);
    Object.assign(artist, updateArtistDto);
    return this.artistRepository.save(artist);
  }

  async remove(id: number) {
    const artist = await this.findOne(id);
    await this.artistRepository.remove(artist);
    return { message: 'Artist deleted successfully' };
  }

  async confirm(id: number) {
    const artist = await this.findOne(id);
    artist.confirmStatus = 'confirmed';
    return this.artistRepository.save(artist);
  }

  async withdraw(id: number) {
    const artist = await this.findOne(id);
    artist.confirmStatus = 'withdrawn';
    return this.artistRepository.save(artist);
  }

  async replace(id: number, replacementData: { name: string; avatar?: string; bio?: string; email?: string; phone?: string }) {
    const originalArtist = await this.findOne(id);
    originalArtist.confirmStatus = 'withdrawn';
    await this.artistRepository.save(originalArtist);

    const newArtist = this.artistRepository.create({
      ...replacementData,
      exhibitionId: originalArtist.exhibitionId,
      confirmStatus: 'confirmed',
    });
    return this.artistRepository.save(newArtist);
  }
}
