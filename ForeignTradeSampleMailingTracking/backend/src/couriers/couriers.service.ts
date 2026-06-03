import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Courier } from '../entities/courier.entity';

@Injectable()
export class CouriersService {
  constructor(
    @InjectRepository(Courier)
    private couriersRepository: Repository<Courier>,
  ) {}

  findAll(): Promise<Courier[]> {
    return this.couriersRepository.find();
  }

  async findOne(id: number): Promise<Courier> {
    const courier = await this.couriersRepository.findOne({ where: { id } });
    if (!courier) {
      throw new NotFoundException(`Courier with ID ${id} not found`);
    }
    return courier;
  }

  async create(courierData: Partial<Courier>): Promise<Courier> {
    const courier = this.couriersRepository.create(courierData);
    return this.couriersRepository.save(courier);
  }

  async update(id: number, courierData: Partial<Courier>): Promise<Courier> {
    await this.couriersRepository.update(id, courierData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.couriersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Courier with ID ${id} not found`);
    }
  }
}
