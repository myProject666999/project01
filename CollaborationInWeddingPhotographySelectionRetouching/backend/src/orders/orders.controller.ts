import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './order.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(@Request() req): Promise<Order[]> {
    return this.ordersService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<Order> {
    return this.ordersService.findById(+id, req.user.id, req.user.role);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createOrderDto: {
      clientId: number;
      weddingDate?: Date;
      coupleNames: string;
      totalAmount?: number;
      remark?: string;
    },
  ): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: {
      weddingDate?: Date;
      coupleNames?: string;
      status?: OrderStatus;
      totalAmount?: number;
      remark?: string;
      depositPaid?: boolean;
      balancePaid?: boolean;
    },
    @Request() req,
  ): Promise<Order> {
    return this.ordersService.update(+id, updateOrderDto, req.user.id, req.user.role);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Request() req,
  ): Promise<Order> {
    return this.ordersService.updateStatus(+id, status, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.ordersService.remove(+id, req.user.id, req.user.role);
  }
}
