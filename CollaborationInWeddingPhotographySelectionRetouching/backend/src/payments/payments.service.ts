import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentType, PaymentStatus } from './payment.entity';
import { OrdersService } from '../orders/orders.service';
import { UserRole } from '../users/user.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private ordersService: OrdersService,
  ) {}

  private generateTransactionId(): string {
    const date = new Date();
    const prefix = `PAY${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}${random}`;
  }

  async findAll(userId: number, userRole: UserRole): Promise<Payment[]> {
    const where: any = {};
    if (userRole === UserRole.CLIENT) {
      where.userId = userId;
    }
    
    return this.paymentsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['order', 'user'],
      select: {
        user: {
          id: true,
          username: true,
          fullName: true,
        },
        order: {
          id: true,
          orderNo: true,
          coupleNames: true,
        },
      },
    });
  }

  async findByOrderId(orderId: number, userId: number, userRole: UserRole): Promise<Payment[]> {
    await this.ordersService.findById(orderId, userId, userRole);
    
    return this.paymentsRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
          fullName: true,
        },
      },
    });
  }

  async findById(id: number, userId: number, userRole: UserRole): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['order', 'user'],
      select: {
        user: {
          id: true,
          username: true,
          fullName: true,
          email: true,
        },
        order: {
          id: true,
          orderNo: true,
          coupleNames: true,
        },
      },
    });
    
    if (!payment) {
      throw new NotFoundException('支付记录不存在');
    }
    
    if (userRole === UserRole.CLIENT && payment.userId !== userId) {
      throw new ForbiddenException('无权访问此支付记录');
    }
    
    return payment;
  }

  async create(
    orderId: number,
    amount: number,
    paymentType: PaymentType,
    paymentMethod: string,
    userId: number,
    userRole: UserRole,
    remark?: string,
  ): Promise<Payment> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以创建支付记录');
    }
    
    const order = await this.ordersService.findById(orderId, userId, userRole);
    
    const payment = this.paymentsRepository.create({
      orderId,
      userId: order.clientId,
      amount,
      paymentType,
      paymentMethod,
      remark,
      transactionId: this.generateTransactionId(),
    });
    
    return this.paymentsRepository.save(payment);
  }

  async processPayment(id: number, userId: number, userRole: UserRole): Promise<Payment> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以处理支付');
    }
    
    const payment = await this.findById(id, userId, userRole);
    
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('此支付状态不允许处理');
    }
    
    await this.paymentsRepository.update(id, {
      status: PaymentStatus.PAID,
      paidAt: new Date(),
    });
    
    if (payment.paymentType === PaymentType.DEPOSIT) {
      await this.ordersService.update(payment.orderId, { depositPaid: true }, userId, userRole);
    } else if (payment.paymentType === PaymentType.BALANCE) {
      await this.ordersService.update(payment.orderId, { balancePaid: true }, userId, userRole);
    }
    
    return this.findById(id, userId, userRole);
  }

  async markAsFailed(id: number, userId: number, userRole: UserRole): Promise<Payment> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以标记支付失败');
    }
    
    const payment = await this.findById(id, userId, userRole);
    
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('此支付状态不允许标记为失败');
    }
    
    await this.paymentsRepository.update(id, {
      status: PaymentStatus.FAILED,
    });
    
    return this.findById(id, userId, userRole);
  }

  async refund(id: number, userId: number, userRole: UserRole): Promise<Payment> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以退款');
    }
    
    const payment = await this.findById(id, userId, userRole);
    
    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('只有已支付的记录可以退款');
    }
    
    await this.paymentsRepository.update(id, {
      status: PaymentStatus.REFUNDED,
    });
    
    return this.findById(id, userId, userRole);
  }

  async updateTransactionId(
    id: number,
    transactionId: string,
    userId: number,
    userRole: UserRole,
  ): Promise<Payment> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以更新交易号');
    }
    
    await this.paymentsRepository.update(id, { transactionId });
    return this.findById(id, userId, userRole);
  }

  async getPaymentSummary(orderId: number, userId: number, userRole: UserRole) {
    await this.ordersService.findById(orderId, userId, userRole);
    
    const payments = await this.paymentsRepository.find({
      where: { orderId, status: PaymentStatus.PAID },
    });
    
    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    
    const depositPayment = payments.find(p => p.paymentType === PaymentType.DEPOSIT);
    const balancePayment = payments.find(p => p.paymentType === PaymentType.BALANCE);
    const revisionPayments = payments.filter(p => p.paymentType === PaymentType.REVISION);
    
    return {
      totalPaid,
      depositPaid: depositPayment ? parseFloat(depositPayment.amount.toString()) : 0,
      balancePaid: balancePayment ? parseFloat(balancePayment.amount.toString()) : 0,
      revisionTotal: revisionPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0),
      revisionCount: revisionPayments.length,
    };
  }
}
