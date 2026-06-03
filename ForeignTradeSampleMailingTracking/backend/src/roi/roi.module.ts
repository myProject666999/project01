import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sample } from '../entities/sample.entity';
import { Mailing } from '../entities/mailing.entity';
import { Feedback } from '../entities/feedback.entity';
import { RoiService } from './roi.service';
import { RoiController } from './roi.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sample, Mailing, Feedback])],
  providers: [RoiService],
  controllers: [RoiController],
  exports: [RoiService],
})
export class RoiModule {}
