import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FloorPlan } from './entities/floor-plan.entity';
import { CreateFloorPlanDto } from './dto/create-floorplan.dto';
import { UpdateFloorPlanDto } from './dto/update-floorplan.dto';

@Injectable()
export class FloorPlanService {
  constructor(
    @InjectRepository(FloorPlan)
    private floorPlanRepository: Repository<FloorPlan>,
  ) {}

  async findOne(id: number) {
    const floorPlan = await this.floorPlanRepository.findOne({ where: { id } });
    if (!floorPlan) {
      throw new NotFoundException(`FloorPlan #${id} not found`);
    }
    return floorPlan;
  }

  async findByExhibition(exhibitionId: number) {
    const floorPlan = await this.floorPlanRepository.findOne({ where: { exhibitionId } });
    if (!floorPlan) {
      throw new NotFoundException(`FloorPlan for exhibition #${exhibitionId} not found`);
    }
    return floorPlan;
  }

  async create(createFloorPlanDto: CreateFloorPlanDto) {
    const floorPlan = this.floorPlanRepository.create(createFloorPlanDto);
    return this.floorPlanRepository.save(floorPlan);
  }

  async update(id: number, updateFloorPlanDto: UpdateFloorPlanDto) {
    const floorPlan = await this.findOne(id);
    Object.assign(floorPlan, updateFloorPlanDto);
    return this.floorPlanRepository.save(floorPlan);
  }

  async updateBgImage(id: number, filename: string) {
    const floorPlan = await this.findOne(id);
    floorPlan.backgroundUrl = filename;
    return this.floorPlanRepository.save(floorPlan);
  }
}
