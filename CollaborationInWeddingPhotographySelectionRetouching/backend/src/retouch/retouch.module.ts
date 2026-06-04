import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetouchService } from './retouch.service';
import { RetouchController } from './retouch.controller';
import { RetouchTask } from './retouch-task.entity';
import { RetouchVersion } from './retouch-version.entity';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [TypeOrmModule.forFeature([RetouchTask, RetouchVersion]), PhotosModule],
  providers: [RetouchService],
  controllers: [RetouchController],
  exports: [RetouchService],
})
export class RetouchModule {}
