import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'username', 'email', 'phone', 'role', 'fullName', 'avatarUrl', 'createdAt'],
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'phone', 'role', 'fullName', 'avatarUrl', 'createdAt'],
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(createUserDto: {
    username: string;
    password: string;
    email: string;
    phone?: string;
    role?: UserRole;
    fullName: string;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.usersRepository.save(user);
    delete savedUser.password;
    return savedUser;
  }

  async update(id: number, updateUserDto: {
    email?: string;
    phone?: string;
    fullName?: string;
    avatarUrl?: string;
  }): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(id, { password: hashedPassword });
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('用户不存在');
    }
  }

  async findRetouchers(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.RETOUCHER },
      select: ['id', 'username', 'email', 'phone', 'fullName', 'avatarUrl'],
    });
  }
}
