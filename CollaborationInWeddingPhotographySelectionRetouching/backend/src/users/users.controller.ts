import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('profile')
  async getProfile(@Request() req): Promise<User> {
    return this.usersService.findById(req.user.id);
  }

  @Get('retouchers')
  async findRetouchers(): Promise<User[]> {
    return this.usersService.findRetouchers();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(+id);
  }

  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: { email?: string; phone?: string; fullName?: string; avatarUrl?: string },
  ): Promise<User> {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: { email?: string; phone?: string; fullName?: string; avatarUrl?: string; role?: UserRole },
  ): Promise<User> {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(+id);
  }
}
