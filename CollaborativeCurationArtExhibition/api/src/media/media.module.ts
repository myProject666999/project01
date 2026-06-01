import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaItem } from './entities/media-item.entity';
import { MediaVersion } from './entities/media-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MediaItem, MediaVersion])],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
