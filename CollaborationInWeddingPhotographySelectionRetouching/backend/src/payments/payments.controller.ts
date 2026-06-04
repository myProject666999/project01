import { Controller, Get, Post, Put, Param, UseGuards, Request, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment, PaymentType } from './payment.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findAll(@Request() req): Promise<Payment[]> {
    return this.paymentsService.findAll(req.user.id, req.user.role);
  }

  @Get('order/:orderId')
  async findByOrderId(@Param('orderId') orderId: string, @Request() req): Promise<Payment[]> {
    return this.paymentsService.findByOrderId(+orderId, req.user.id, req.user.role);
  }

  @Get('order/:orderId/summary')
  async getPaymentSummary(@Param('orderId') orderId: string, @Request() req) {
    return this.paymentsService.getPaymentSummary(+orderId, req.user.id, req.user.role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<Payment> {
    return this.paymentsService.findById(+id, req.user.id, req.user.role);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createPaymentDto: {
      orderId: number;
      amount: number;
      paymentType: PaymentType;
      paymentMethod: string;
      remark?: string;
    },
    @Request() req,
  ): Promise<Payment> {
    return this.paymentsService.create(
      createPaymentDto.orderId,
      createPaymentDto.amount,
      createPaymentDto.paymentType,
      createPaymentDto.paymentMethod,
      req.user.id,
      req.user.role,
      createPaymentDto.remark,
    );
  }

  @Post(':id/process')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async processPayment(@Param('id') id: string, @Request() req): Promise<Payment> {
    return this.paymentsService.processPayment(+id, req.user.id, req.user.role);
  }

  @Post(':id/fail')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async markAsFailed(@Param('id') id: string, @Request() req): Promise<Payment> {
    return this.paymentsService.markAsFailed(+id, req.user.id, req.user.role);
  }

  @Post(':id/refund')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async refund(@Param('id') id: string, @Request() req): Promise<Payment> {
    return this.paymentsService.refund(+id, req.user.id, req.user.role);
  }

  @Put(':id/transaction')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateTransactionId(
    @Param('id') id: string,
    @Body('transactionId') transactionId: string,
    @Request() req,
  ): Promise<Payment> {
    return this.paymentsService.updateTransactionId(+id, transactionId, req.user.id, req.user.role);
  }
}
