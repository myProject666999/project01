import { Injectable } from '@nestjs/common';
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
    return this.floorPlanRepository.findOne({ where: { id } });
  }

  async findByExhibition(exhibitionId: number) {
    let floorPlan = await this.floorPlanRepository.findOne({ where: { exhibitionId } });
    if (!floorPlan) {
      floorPlan = this.floorPlanRepository.create({
        exhibitionId,
        width: 1200,
        height: 800,
        layoutData: { artworks: [] },
      });
      floorPlan = await this.floorPlanRepository.save(floorPlan);
    }
    if (floorPlan.backgroundUrl && !floorPlan.backgroundUrl.startsWith('http')) {
      floorPlan.backgroundUrl = `http://localhost:3000/uploads/floorplans/${floorPlan.backgroundUrl}`;
    }
    return floorPlan;
  }

  async create(createFloorPlanDto: CreateFloorPlanDto) {
    const floorPlan = this.floorPlanRepository.create(createFloorPlanDto);
    return this.floorPlanRepository.save(floorPlan);
  }

  async update(id: number, updateFloorPlanDto: UpdateFloorPlanDto) {
    await this.floorPlanRepository.update(id, updateFloorPlanDto);
    return this.findOne(id);
  }

  async updateBgImage(id: number, filename: string) {
    await this.floorPlanRepository.update(id, { backgroundUrl: filename });
    const floorPlan = await this.findOne(id);
    if (floorPlan) {
      floorPlan.backgroundUrl = `http://localhost:3000/uploads/floorplans/${filename}`;
    }
    return floorPlan;
  }
}
