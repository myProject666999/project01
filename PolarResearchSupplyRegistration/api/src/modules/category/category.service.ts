import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../../dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: TreeRepository<Category>,
  ) {}

  findAll() {
    return this.categoryRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async findTree() {
    const trees = await this.categoryRepo.findTrees();
    const sortChildren = (nodes: Category[]): Category[] => {
      nodes.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          node.children = sortChildren(node.children);
        }
      }
      return nodes;
    };
    return sortChildren(trees);
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
