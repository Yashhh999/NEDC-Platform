import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
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
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  createOrder(
    @CurrentUser() user: { id: string; email: string; role: string },
    @Body() dto: CreateOrderDto,
  ) {
    return this.paymentsService.createOrder(user.id, dto);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
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

  // Razorpay Webhook (public, no JWT). The raw body is captured by the
  // express raw-body middleware mounted in main.ts at this exact path.
  @Post('webhook')
  webhook(
    @Req() req: Request,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const raw = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!raw) {
      throw new BadRequestException('Webhook raw body not captured');
    }
    return this.paymentsService.handleWebhook(raw, signature);
  }

  @Post('apply-coupon')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  applyCoupon(@Body() dto: ApplyCouponDto) {
    return this.paymentsService.applyCoupon(dto.code, dto.courseId);
  }
}
