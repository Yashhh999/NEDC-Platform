import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  createOrder(
    @CurrentUser() user: { id: string; email: string; role: string },
    @Body() dto: CreateOrderDto,
  ) {
    return this.paymentsService.createOrder(user.id, dto);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  verifyPayment(
    @CurrentUser() user: { id: string; email: string; role: string },
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPayment(user.id, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyPayments(
    @CurrentUser() user: { id: string; email: string; role: string },
  ) {
    return this.paymentsService.getMyPayments(user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAllPayments() {
    return this.paymentsService.getAllPayments();
  }

  // ─── Razorpay Webhook (public, no JWT) ─────────────
  @Post('webhook')
  webhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(body, signature);
  }

  // ─── Apply Coupon (requires auth) ───────────────────
  @Post('apply-coupon')
  @UseGuards(JwtAuthGuard)
  applyCoupon(@Body() dto: ApplyCouponDto) {
    return this.paymentsService.applyCoupon(dto.code, dto.courseId);
  }
}
