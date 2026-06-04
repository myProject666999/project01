import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PhotoComment } from './comment.entity';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [TypeOrmModule.forFeature([PhotoComment]), PhotosModule],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class PhotoCommentsModule {}
