import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member, MemberRole } from '../../entities';
import { CreateMemberDto, UpdateMemberDto } from '../../dto/member.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,
  ) {}

  findAll() {
    return this.memberRepo.find({ relations: ['project'] });
  }

  findOne(id: number) {
    return this.memberRepo.findOne({ where: { id }, relations: ['project'] });
  }

  create(dto: CreateMemberDto) {
    const entity = this.memberRepo.create(dto);
    return this.memberRepo.save(entity);
  }

  async update(id: number, dto: UpdateMemberDto) {
    await this.memberRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.memberRepo.delete(id);
    return { deleted: true };
  }
}
