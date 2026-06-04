import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loom } from '../../entities/loom.entity';
import { LoomService } from './loom.service';
import { LoomController } from './loom.controller';
import { RedisService } from '../../services/redis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Loom])],
  controllers: [LoomController],
  providers: [LoomService, RedisService],
  exports: [LoomService],
})
export class LoomModule {}
