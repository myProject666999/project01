import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { UserRole } from '../users/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  private generateOrderNo(): string {
    const date = new Date();
    const prefix = `WD${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${random}`;
  }

  async findAll(userId: number, userRole: UserRole): Promise<Order[]> {
    const where: any = {};
    if (userRole === UserRole.CLIENT) {
      where.clientId = userId;
    }
    return this.ordersRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['client'],
      select: {
        client: {
          id: true,
          username: true,
          fullName: true,
        },
      },
    });
  }

  async findById(id: number, userId: number, userRole: UserRole): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['client'],
      select: {
        client: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          phone: true,
        },
      },
    });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    if (userRole === UserRole.CLIENT && order.clientId !== userId) {
      throw new ForbiddenException('无权访问此订单');
    }
    return order;
  }

  async create(createOrderDto: {
    clientId: number;
    weddingDate?: Date;
    coupleNames: string;
    totalAmount?: number;
    remark?: string;
  }): Promise<Order> {
    const order = this.ordersRepository.create({
      ...createOrderDto,
      orderNo: this.generateOrderNo(),
    });
    return this.ordersRepository.save(order);
  }

  async update(id: number, updateOrderDto: {
    weddingDate?: Date;
    coupleNames?: string;
    status?: OrderStatus;
    totalAmount?: number;
    remark?: string;
    depositPaid?: boolean;
    balancePaid?: boolean;
  }, userId: number, userRole: UserRole): Promise<Order> {
    const order = await this.findById(id, userId, userRole);
    await this.ordersRepository.update(id, updateOrderDto);
    return this.findById(id, userId, userRole);
  }

  async updateStatus(id: number, status: OrderStatus, userId: number, userRole: UserRole): Promise<Order> {
    return this.update(id, { status }, userId, userRole);
  }

  async updatePhotoCounts(id: number, userId: number, userRole: UserRole): Promise<void> {
    const order = await this.findById(id, userId, userRole);
    await this.ordersRepository.query(`
      UPDATE orders 
      SET total_photos = (SELECT COUNT(*) FROM photos WHERE order_id = ?),
          selected_photos = (SELECT COUNT(*) FROM photos WHERE order_id = ? AND is_selected = 1)
      WHERE id = ?
    `, [id, id, id]);
  }

  async remove(id: number, userId: number, userRole: UserRole): Promise<void> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以删除订单');
    }
    const result = await this.ordersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('订单不存在');
    }
  }
}
