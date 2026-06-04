import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { LoomService } from './loom.service';
import { Loom, LoomStatus } from '../../entities/loom.entity';
import { RealtimeData } from '../../services/redis.service';

@Controller('api/looms')
export class LoomController {
  constructor(private readonly loomService: LoomService) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '50',
    @Query('status') status?: string,
  ): Promise<{ list: Loom[]; total: number }> {
    return await this.loomService.findAll(
      parseInt(page),
      parseInt(pageSize),
      status !== undefined ? parseInt(status) as LoomStatus : undefined,
    );
  }

  @Get('compatible/:specId')
  async getCompatibleLooms(@Param('specId') specId: string): Promise<Loom[]> {
    return await this.loomService.getCompatibleLooms(parseInt(specId));
  }

  @Get('code/:loomCode')
  async findByCode(@Param('loomCode') loomCode: string): Promise<Loom> {
    return await this.loomService.findByCode(loomCode);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Loom> {
    return await this.loomService.findOne(parseInt(id));
  }

  @Post()
  async create(@Body() data: Partial<Loom>): Promise<Loom> {
    return await this.loomService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Loom>): Promise<Loom> {
    return await this.loomService.update(parseInt(id), data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.loomService.remove(parseInt(id));
  }

  @Get('all/realtime')
  async getAllRealtimeStatus(): Promise<Array<{ loom: Loom; realtime: RealtimeData | null }>> {
    return await this.loomService.getAllRealtimeStatus();
  }

  @Get(':id/realtime')
  async getRealtimeStatus(@Param('id') id: string): Promise<{ loom: Loom; realtime: RealtimeData | null }> {
    return await this.loomService.getRealtimeStatus(parseInt(id));
  }
}
