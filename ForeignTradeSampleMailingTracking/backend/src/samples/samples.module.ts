import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sample } from '../entities/sample.entity';
import { SamplesService } from './samples.service';
import { SamplesController } from './samples.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sample])],
  providers: [SamplesService],
  controllers: [SamplesController],
  exports: [SamplesService],
})
export class SamplesModule {}
