import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SheetMusicService } from './sheet-music.service';
import { SheetMusicController } from './sheet-music.controller';
import { SheetMusic } from '../../entities/sheet-music.entity';
import { User } from '../../entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([SheetMusic, User]), AuthModule],
  controllers: [SheetMusicController],
  providers: [SheetMusicService],
  exports: [SheetMusicService],
})
export class SheetMusicModule {}
