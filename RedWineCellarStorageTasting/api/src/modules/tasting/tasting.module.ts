import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TastingNote } from '@/entities/tasting-note.entity';
import { TastingController } from './tasting.controller';
import { TastingService } from './tasting.service';

@Module({
  imports: [TypeOrmModule.forFeature([TastingNote])],
  controllers: [TastingController],
  providers: [TastingService],
  exports: [TastingService],
})
export class TastingModule {}
