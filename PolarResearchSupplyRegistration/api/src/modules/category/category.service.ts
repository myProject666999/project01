import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../../dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  findAll() {
    return this.categoryRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async findTree() {
    const all = await this.categoryRepo.find({ order: { sortOrder: 'ASC' } });
    const map = new Map<number, any>();
    for (const cat of all) {
      map.set(cat.id, { ...cat, children: [] });
    }
    const roots: any[] = [];
    for (const cat of all) {
      const node = map.get(cat.id);
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  findOne(id: number) {
    return this.categoryRepo.findOne({ where: { id } });
  }

  create(dto: CreateCategoryDto) {
    const entity = this.categoryRepo.create(dto);
    return this.categoryRepo.save(entity);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.categoryRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.categoryRepo.delete(id);
    return { deleted: true };
  }
}
