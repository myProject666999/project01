import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistReplacementService } from './artist-replacement.service';
import { ArtistReplacementController } from './artist-replacement.controller';
import { ArtistReplacement } from './entities/artist-replacement.entity';
import { Artist } from '../artist/entities/artist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArtistReplacement, Artist])],
  controllers: [ArtistReplacementController],
  providers: [ArtistReplacementService],
  exports: [ArtistReplacementService],
})
export class ArtistReplacementModule {}
