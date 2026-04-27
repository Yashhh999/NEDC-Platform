import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as crypto from 'crypto';

// ─── Mock Setup ─────────────────────────────────────────

const mockPrismaService = {
  course: { findUnique: jest.fn() },
  enrollment: { findUnique: jest.fn(), create: jest.fn(), upsert: jest.fn() },
  payment: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  coupon: { findUnique: jest.fn(), update: jest.fn() },
  $transaction: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const map: Record<string, string> = {
      RAZORPAY_KEY_ID: 'rzp_test_key',
      RAZORPAY_KEY_SECRET: 'test_secret_123',
      RAZORPAY_WEBHOOK_SECRET: 'webhook_secret_456',
    };
    return map[key];
  }),
};

// Mock Razorpay constructor
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({ id: 'order_test123' }),
    },
  }));
});

// ─── Test Suite ─────────────────────────────────────────

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  // ─── createOrder ────────────────────────────────────

  describe('createOrder', () => {
    const userId = 'user-1';
    const dto = { courseId: 'course-1' };

    it('should throw NotFoundException if course does not exist', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(service.createOrder(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if already enrolled', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue({
        id: 'course-1',
        title: 'Test Course',
        price: 2999,
      });
      mockPrismaService.enrollment.findUnique.mockResolvedValue({
        id: 'enroll-1',
      });

      await expect(service.createOrder(userId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should return existing pending order if one exists', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue({
        id: 'course-1',
        title: 'Test Course',
        price: 2999,
      });
      mockPrismaService.enrollment.findUnique.mockResolvedValue(null);
      mockPrismaService.payment.findFirst.mockResolvedValue({
        orderId: 'order_existing',
        amount: 2999,
        currency: 'INR',
      });

      const result = await service.createOrder(userId, dto);
      expect(result.orderId).toBe('order_existing');
    });

    it('should create a new Razorpay order for a valid request', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue({
        id: 'course-1',
        title: 'Test Course',
        price: 2999,
      });
      mockPrismaService.enrollment.findUnique.mockResolvedValue(null);
      mockPrismaService.payment.findFirst.mockResolvedValue(null);
      mockPrismaService.payment.create.mockResolvedValue({});

      const result = await service.createOrder(userId, dto);

      expect(result.orderId).toBe('order_test123');
      expect(result.amount).toBe(299900); // paise
      expect(result.currency).toBe('INR');
      expect(result.key).toBe('rzp_test_key');
      expect(mockPrismaService.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
            courseId: 'course-1',
            orderId: 'order_test123',
            amount: 2999,
            couponCode: null,
          }),
        }),
      );
    });
  });

  // ─── verifyPayment ──────────────────────────────────

  describe('verifyPayment', () => {
    const userId = 'user-1';

    it('should throw NotFoundException if payment not found', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      await expect(
        service.verifyPayment(userId, {
          razorpay_order_id: 'order_1',
          razorpay_payment_id: 'pay_1',
          razorpay_signature: 'sig',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if payment belongs to another user', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        userId: 'user-2',
        status: 'PENDING',
      });

      await expect(
        service.verifyPayment(userId, {
          razorpay_order_id: 'order_1',
          razorpay_payment_id: 'pay_1',
          razorpay_signature: 'sig',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if payment already verified', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        userId,
        status: 'PAID',
      });

      await expect(
        service.verifyPayment(userId, {
          razorpay_order_id: 'order_1',
          razorpay_payment_id: 'pay_1',
          razorpay_signature: 'sig',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should mark payment as FAILED on invalid signature', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        userId,
        status: 'PENDING',
        courseId: 'course-1',
      });
      mockPrismaService.payment.update.mockResolvedValue({});

      await expect(
        service.verifyPayment(userId, {
          razorpay_order_id: 'order_1',
          razorpay_payment_id: 'pay_1',
          razorpay_signature: 'invalid_signature',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'FAILED' },
        }),
      );
    });

    it('should verify payment, enroll user, and increment coupon on valid signature', async () => {
      const orderId = 'order_1';
      const paymentId = 'pay_1';
      const secret = 'test_secret_123';
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      mockPrismaService.payment.findUnique.mockResolvedValue({
        userId,
        status: 'PENDING',
        courseId: 'course-1',
        couponCode: 'SAVE20',
      });

      mockPrismaService.$transaction.mockResolvedValue([
        {
          id: 'payment-1',
          orderId,
          paymentId,
          amount: 2399,
          status: 'PAID',
        },
      ]);

      const result = await service.verifyPayment(userId, {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature,
      });

      expect(result.message).toBe(
        'Payment verified and enrolled successfully',
      );
      expect(result.payment.status).toBe('PAID');

      // Verify that $transaction was called with 3 operations (payment + enrollment + coupon)
      const transactionArgs = mockPrismaService.$transaction.mock.calls[0][0];
      expect(transactionArgs).toHaveLength(3);
    });
  });

  // ─── applyCoupon ────────────────────────────────────

  describe('applyCoupon', () => {
    it('should throw NotFoundException for invalid coupon code', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(null);

      await expect(
        service.applyCoupon('INVALID', 'course-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for inactive coupon', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue({
        code: 'INACTIVE',
        isActive: false,
      });

      await expect(
        service.applyCoupon('INACTIVE', 'course-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired coupon', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue({
        code: 'EXPIRED',
        isActive: true,
        expiresAt: new Date('2020-01-01'),
      });

      await expect(
        service.applyCoupon('EXPIRED', 'course-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when max uses reached', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue({
        code: 'MAXED',
        isActive: true,
        expiresAt: null,
        maxUses: 100,
        usedCount: 100,
      });

      await expect(
        service.applyCoupon('MAXED', 'course-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return valid discount for a valid coupon', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue({
        code: 'SAVE20',
        isActive: true,
        expiresAt: null,
        maxUses: 100,
        usedCount: 5,
        discountPercent: 20,
      });
      mockPrismaService.course.findUnique.mockResolvedValue({
        id: 'course-1',
        price: 2999,
      });

      const result = await service.applyCoupon('SAVE20', 'course-1');

      expect(result.valid).toBe(true);
      expect(result.code).toBe('SAVE20');
      expect(result.discountPercent).toBe(20);
      expect(result.originalPrice).toBe(2999);
      expect(result.discount).toBe(600); // 2999 * 0.2 ≈ 599.8 → rounded to 600
      expect(result.finalPrice).toBe(2399); // 2999 - 600 = 2399
    });
  });

  // ─── handleWebhook ──────────────────────────────────

  describe('handleWebhook', () => {
    const webhookSecret = 'webhook_secret_456';
    const signRaw = (raw: Buffer) =>
      crypto.createHmac('sha256', webhookSecret).update(raw).digest('hex');

    it('should throw BadRequestException on invalid webhook signature', async () => {
      const raw = Buffer.from(
        JSON.stringify({ event: 'payment.captured', payload: {} }),
      );
      await expect(
        service.handleWebhook(raw, 'invalid_signature'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return ignored if no payment entity in payload', async () => {
      const raw = Buffer.from(
        JSON.stringify({ event: 'payment.captured', payload: {} }),
      );
      const result = await service.handleWebhook(raw, signRaw(raw));
      expect(result.status).toBe('ignored');
    });

    it('should process payment.captured event and increment coupon', async () => {
      const raw = Buffer.from(
        JSON.stringify({
          event: 'payment.captured',
          payload: {
            payment: { entity: { id: 'pay_123', order_id: 'order_456' } },
          },
        }),
      );
      mockPrismaService.payment.findUnique.mockResolvedValue({
        userId: 'user-1',
        courseId: 'course-1',
        status: 'PENDING',
        couponCode: 'SAVE20',
      });
      mockPrismaService.$transaction.mockResolvedValue([]);

      const result = await service.handleWebhook(raw, signRaw(raw));

      expect(result.status).toBe('ok');
      const transactionArgs = mockPrismaService.$transaction.mock.calls[0][0];
      expect(transactionArgs).toHaveLength(3);
    });

    it('should process payment.failed event', async () => {
      const raw = Buffer.from(
        JSON.stringify({
          event: 'payment.failed',
          payload: {
            payment: { entity: { id: 'pay_fail', order_id: 'order_fail' } },
          },
        }),
      );
      mockPrismaService.payment.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.handleWebhook(raw, signRaw(raw));

      expect(result.status).toBe('ok');
      expect(mockPrismaService.payment.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orderId: 'order_fail', status: 'PENDING' },
          data: { status: 'FAILED' },
        }),
      );
    });
  });
});
