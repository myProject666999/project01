import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SamplesService } from './samples.service';
import { Sample } from '../entities/sample.entity';

@Controller('samples')
export class SamplesController {
  constructor(private readonly samplesService: SamplesService) {}

  @Get()
  findAll(): Promise<Sample[]> {
    return this.samplesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Sample> {
    return this.samplesService.findOne(+id);
  }

  @Post()
  create(@Body() sampleData: Partial<Sample>): Promise<Sample> {
    return this.samplesService.create(sampleData);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() sampleData: Partial<Sample>): Promise<Sample> {
    return this.samplesService.update(+id, sampleData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.samplesService.remove(+id);
  }
}
