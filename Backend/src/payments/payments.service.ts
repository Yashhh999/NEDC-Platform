import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { PaymentStatus } from '@prisma/client';
import * as crypto from 'crypto';

// Razorpay doesn't have official TS types, so we use require
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');

@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (keyId && keySecret) {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
  }

  // ─── Create Razorpay Order ────────────────────────────
  async createOrder(userId: string, dto: CreateOrderDto) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if already enrolled (no need to pay again)
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: dto.courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Already enrolled in this course');
    }

    // Check if there's a pending payment for this course
    const pendingPayment = await this.prisma.payment.findFirst({
      where: {
        userId,
        courseId: dto.courseId,
        status: PaymentStatus.PENDING,
      },
    });

    if (pendingPayment) {
      // Return existing pending order
      return {
        orderId: pendingPayment.orderId,
        amount: pendingPayment.amount,
        currency: pendingPayment.currency,
        courseTitle: course.title,
        key: this.configService.get<string>('RAZORPAY_KEY_ID'),
      };
    }

    if (!this.razorpay) {
      throw new BadRequestException(
        'Payment gateway is not configured. Please add Razorpay API keys.',
      );
    }

    // Calculate price (apply coupon if provided)
    let finalPrice = course.price;
    let couponCode: string | null = null;

    if (dto.couponCode) {
      const couponResult = await this.applyCoupon(dto.couponCode, dto.courseId);
      finalPrice = couponResult.finalPrice;
      couponCode = couponResult.code;
    }

    // Create Razorpay order
    const amountInPaise = Math.round(finalPrice * 100); // Razorpay expects paise

    const razorpayOrder = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
        courseId: dto.courseId,
        courseTitle: course.title,
      },
    });

    // Save payment record (including couponCode if applied)
    await this.prisma.payment.create({
      data: {
        userId,
        courseId: dto.courseId,
        orderId: razorpayOrder.id,
        amount: finalPrice,
        currency: 'INR',
        status: PaymentStatus.PENDING,
        couponCode,
      },
    });

    return {
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      courseTitle: course.title,
      key: this.configService.get<string>('RAZORPAY_KEY_ID'),
    };
  }

  // ─── Verify Razorpay Payment ──────────────────────────
  async verifyPayment(userId: string, dto: VerifyPaymentDto) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = dto;

    // Find the payment record
    const payment = await this.prisma.payment.findUnique({
      where: { orderId: razorpay_order_id },
    });

    if (!payment) {
      throw new NotFoundException('Payment order not found');
    }

    if (payment.userId !== userId) {
      throw new BadRequestException('Payment does not belong to this user');
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new ConflictException('Payment already verified');
    }

    // Verify signature using HMAC SHA256
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!keySecret) {
      throw new BadRequestException('Payment gateway is not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Mark payment as failed
      await this.prisma.payment.update({
        where: { orderId: razorpay_order_id },
        data: { status: PaymentStatus.FAILED },
      });

      throw new BadRequestException('Invalid payment signature');
    }

    // Payment verified — update status, auto-enroll, and increment coupon usage
    const transactionOps: any[] = [
      // Mark payment as paid
      this.prisma.payment.update({
        where: { orderId: razorpay_order_id },
        data: {
          paymentId: razorpay_payment_id,
          status: PaymentStatus.PAID,
        },
      }),

      // Auto-enroll user in the course
      this.prisma.enrollment.create({
        data: {
          userId: payment.userId,
          courseId: payment.courseId,
        },
      }),
    ];

    // Increment coupon usedCount if a coupon was applied
    if (payment.couponCode) {
      transactionOps.push(
        this.prisma.coupon.update({
          where: { code: payment.couponCode },
          data: { usedCount: { increment: 1 } },
        }),
      );
    }

    const [updatedPayment] = await this.prisma.$transaction(transactionOps);

    return {
      message: 'Payment verified and enrolled successfully',
      payment: {
        id: updatedPayment.id,
        orderId: updatedPayment.orderId,
        paymentId: updatedPayment.paymentId,
        amount: updatedPayment.amount,
        status: updatedPayment.status,
      },
    };
  }

  // ─── User: My payment history ─────────────────────────
  async getMyPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Admin: All payments ──────────────────────────────
  async getAllPayments() {
    return this.prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Razorpay Webhook ────────────────────────────────
  // Uses RAZORPAY_WEBHOOK_SECRET (set in Razorpay Dashboard),
  // NOT the API key secret.
  async handleWebhook(body: any, signature: string) {
    const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    // Verify webhook signature using the dedicated webhook secret
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = body.event;
    const payload = body.payload?.payment?.entity;

    if (!payload) return { status: 'ignored' };

    if (event === 'payment.captured') {
      const orderId = payload.order_id;
      const payment = await this.prisma.payment.findUnique({
        where: { orderId },
      });

      if (payment && payment.status !== PaymentStatus.PAID) {
        const transactionOps: any[] = [
          this.prisma.payment.update({
            where: { orderId },
            data: {
              paymentId: payload.id,
              status: PaymentStatus.PAID,
            },
          }),
          this.prisma.enrollment.upsert({
            where: {
              userId_courseId: {
                userId: payment.userId,
                courseId: payment.courseId,
              },
            },
            update: {},
            create: {
              userId: payment.userId,
              courseId: payment.courseId,
            },
          }),
        ];

        // Increment coupon usedCount if a coupon was applied
        if (payment.couponCode) {
          transactionOps.push(
            this.prisma.coupon.update({
              where: { code: payment.couponCode },
              data: { usedCount: { increment: 1 } },
            }),
          );
        }

        await this.prisma.$transaction(transactionOps);
      }
    } else if (event === 'payment.failed') {
      const orderId = payload.order_id;
      await this.prisma.payment.updateMany({
        where: { orderId, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.FAILED },
      });
    }

    return { status: 'ok' };
  }

  // ─── Coupon Apply ────────────────────────────────────
  async applyCoupon(code: string, courseId: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is no longer active');
    }

    // Check expiry
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new BadRequestException('This coupon has expired');
    }

    // Check usage limit
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    // Get course price
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const discount = (course.price * coupon.discountPercent) / 100;
    const finalPrice = Math.max(0, course.price - discount);

    // Increment usedCount now that validation has passed
    await this.prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    });

    return {
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      originalPrice: course.price,
      discount: Math.round(discount),
      finalPrice: Math.round(finalPrice),
      currency: 'INR',
    };
  }
}
