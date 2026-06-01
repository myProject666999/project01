import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtworkService } from './artwork.service';
import { ArtworkController } from './artwork.controller';
import { Artwork } from './entities/artwork.entity';
import { ArtworkStatusLog } from './entities/artwork-status-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artwork, ArtworkStatusLog])],
  controllers: [ArtworkController],
  providers: [ArtworkService],
  exports: [ArtworkService],
})
export class ArtworkModule {}
