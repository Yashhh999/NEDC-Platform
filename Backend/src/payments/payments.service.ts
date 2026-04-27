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

// ─── Razorpay types (no official @types package) ─────
interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

interface RazorpayInstance {
  orders: {
    create(opts: {
      amount: number;
      currency: string;
      receipt: string;
      notes?: Record<string, string>;
    }): Promise<RazorpayOrder>;
  };
}

interface WebhookPayload {
  event: string;
  payload?: {
    payment?: {
      entity?: {
        id: string;
        order_id: string;
      };
    };
  };
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
import Razorpay = require('razorpay');

// Constant-time hex string comparison. Inputs that are not equal length
// fail-fast rather than throwing on timingSafeEqual.
function safeEqualHex(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

@Injectable()
export class PaymentsService {
  private razorpay: RazorpayInstance | null = null;

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
      }) as RazorpayInstance;
    }
  }

  // ─── Create Razorpay Order ────────────────────────────
  async createOrder(userId: string, dto: CreateOrderDto) {
    // Course must exist and not be soft-deleted.
    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, deletedAt: null },
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

    const razorpayOrder: RazorpayOrder = await this.razorpay.orders.create({
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
  // Race-safe: the verify HTTP call from the frontend can run concurrently
  // with Razorpay's webhook delivery. We must guarantee that exactly ONE of
  // them performs the side-effects (status flip, enrollment, coupon
  // increment) regardless of ordering.
  //
  // The "claim" is a conditional UPDATE of the payment row from PENDING →
  // PAID; whichever writer the database serializes first gets count=1, the
  // other gets count=0 and bails out without side-effects.
  async verifyPayment(userId: string, dto: VerifyPaymentDto) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = dto;

    const payment = await this.prisma.payment.findUnique({
      where: { orderId: razorpay_order_id },
    });

    if (!payment) {
      throw new NotFoundException('Payment order not found');
    }

    if (payment.userId !== userId) {
      throw new BadRequestException('Payment does not belong to this user');
    }

    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!keySecret) {
      throw new BadRequestException('Payment gateway is not configured');
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (!safeEqualHex(expectedSignature, razorpay_signature)) {
      // Best-effort mark as failed only if still pending. Don't surface
      // BadRequest if the row was already finalized by the webhook.
      await this.prisma.payment.updateMany({
        where: { orderId: razorpay_order_id, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.FAILED },
      });
      throw new BadRequestException('Invalid payment signature');
    }

    return this.finalizePayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      userId: payment.userId,
      courseId: payment.courseId,
      couponCode: payment.couponCode,
      successMessage: 'Payment verified and enrolled successfully',
    });
  }

  // Shared finalization for both the verify HTTP call and the webhook.
  // Atomically claims the payment row; only the winning claim performs
  // enrollment + coupon increment. The loser sees count=0 and reports
  // success without re-doing the work.
  private async finalizePayment(args: {
    orderId: string;
    paymentId: string;
    userId: string;
    courseId: string;
    couponCode: string | null;
    successMessage: string;
  }) {
    const claim = await this.prisma.payment.updateMany({
      where: { orderId: args.orderId, status: PaymentStatus.PENDING },
      data: { paymentId: args.paymentId, status: PaymentStatus.PAID },
    });

    if (claim.count === 0) {
      // Already processed (by the webhook, by a duplicate verify call, or
      // by a redelivery). Idempotent success — do not run side-effects.
      const existing = await this.prisma.payment.findUnique({
        where: { orderId: args.orderId },
      });
      return {
        message: 'Payment already verified',
        payment: existing
          ? {
              id: existing.id,
              orderId: existing.orderId,
              paymentId: existing.paymentId,
              amount: existing.amount,
              status: existing.status,
            }
          : null,
      };
    }

    // We won the claim. Run side-effects in a transaction; enrollment is
    // an upsert because a prior partial run could have created it.
    await this.prisma.$transaction(async (tx) => {
      await tx.enrollment.upsert({
        where: {
          userId_courseId: { userId: args.userId, courseId: args.courseId },
        },
        update: {},
        create: { userId: args.userId, courseId: args.courseId },
      });

      if (args.couponCode) {
        // Atomic increment-if-still-valid. Two-column comparison is not
        // expressible in Prisma's update; use a raw query. Tolerate
        // count=0 (coupon expired or maxed between order creation and
        // payment finalization — the user already received the locked-in
        // discount on their payment row, but we don't over-count usage).
        await tx.$executeRaw`
          UPDATE "Coupon"
             SET "usedCount" = "usedCount" + 1
           WHERE "code" = ${args.couponCode}
             AND "isActive" = true
             AND "usedCount" < "maxUses"
             AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
        `;
      }
    });

    const finalRow = await this.prisma.payment.findUnique({
      where: { orderId: args.orderId },
    });

    return {
      message: args.successMessage,
      payment: finalRow && {
        id: finalRow.id,
        orderId: finalRow.orderId,
        paymentId: finalRow.paymentId,
        amount: finalRow.amount,
        status: finalRow.status,
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
  // NOT the API key secret. The signature is computed over the *raw* request
  // bytes — JSON.stringify can re-order keys and would silently fail.
  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>(
      'RAZORPAY_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }
    if (!signature || !rawBody?.length) {
      throw new BadRequestException('Missing webhook signature or body');
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (!safeEqualHex(expectedSignature, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    let body: WebhookPayload;
    try {
      body = JSON.parse(rawBody.toString('utf8')) as WebhookPayload;
    } catch {
      throw new BadRequestException('Webhook body is not valid JSON');
    }

    const event = body.event;
    const payload = body.payload?.payment?.entity;

    if (!payload) return { status: 'ignored' };

    if (event === 'payment.captured') {
      const orderId = payload.order_id;
      const payment = await this.prisma.payment.findUnique({
        where: { orderId },
      });

      if (!payment) {
        // Webhook arrived for an order we don't know about. Acknowledge
        // so Razorpay stops retrying, but log for ops review.
        return { status: 'unknown_order' };
      }

      // Idempotent — same atomic-claim pattern as verifyPayment, so a
      // race between the HTTP verify call and this webhook never grants
      // double enrollment or double coupon use.
      await this.finalizePayment({
        orderId,
        paymentId: payload.id,
        userId: payment.userId,
        courseId: payment.courseId,
        couponCode: payment.couponCode,
        successMessage: 'Webhook processed',
      });
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
  // Preview-only: validates the coupon and returns the would-be price.
  // The usedCount is NOT incremented here — that happens exactly once,
  // atomically, when finalizePayment claims the payment row. Incrementing
  // at preview time double-counted every paid order and let abandoned
  // previews exhaust maxUses.
  async applyCoupon(code: string, courseId: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }
    if (!coupon.isActive) {
      throw new BadRequestException('This coupon is no longer active');
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new BadRequestException('This coupon has expired');
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }

    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const discount = (course.price * coupon.discountPercent) / 100;
    const finalPrice = Math.max(0, course.price - discount);

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
