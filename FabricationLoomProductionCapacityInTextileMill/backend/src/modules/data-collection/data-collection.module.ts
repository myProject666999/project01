import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LoomRealtimeData } from '../../entities/loom-realtime-data.entity';
import { DataCollectionService } from './data-collection.service';
import { DataCollectionController } from './data-collection.controller';
import { RedisService } from '../../services/redis.service';
import { LoomModule } from '../loom/loom.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoomRealtimeData]),
    ScheduleModule.forRoot(),
    LoomModule,
  ],
  controllers: [DataCollectionController],
  providers: [DataCollectionService, RedisService],
  exports: [DataCollectionService],
})
export class DataCollectionModule {}
