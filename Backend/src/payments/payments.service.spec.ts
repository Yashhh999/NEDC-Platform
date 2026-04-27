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

// Each `tx.*` call inside service.$transaction(async tx => ...) is
// recorded so individual tests can assert on what got called.
const txMock = {
  enrollment: { upsert: jest.fn() },
  $executeRaw: jest.fn(),
};

const mockPrismaService = {
  course: { findUnique: jest.fn(), findFirst: jest.fn() },
  enrollment: { findUnique: jest.fn() },
  payment: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  coupon: { findUnique: jest.fn() },
  $transaction: jest.fn(async (cb: (tx: typeof txMock) => Promise<void>) => {
    await cb(txMock);
  }),
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

jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({ id: 'order_test123' }),
    },
  }));
});

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    txMock.enrollment.upsert.mockReset();
    txMock.$executeRaw.mockReset();

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

    it('throws NotFoundException if course does not exist or is soft-deleted', async () => {
      mockPrismaService.course.findFirst.mockResolvedValue(null);
      await expect(service.createOrder(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException if already enrolled', async () => {
      mockPrismaService.course.findFirst.mockResolvedValue({
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

    it('returns existing pending order if one exists', async () => {
      mockPrismaService.course.findFirst.mockResolvedValue({
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

    it('creates a new Razorpay order for a valid request', async () => {
      mockPrismaService.course.findFirst.mockResolvedValue({
        id: 'course-1',
        title: 'Test Course',
        price: 2999,
      });
      mockPrismaService.enrollment.findUnique.mockResolvedValue(null);
      mockPrismaService.payment.findFirst.mockResolvedValue(null);
      mockPrismaService.payment.create.mockResolvedValue({});

      const result = await service.createOrder(userId, dto);

      expect(result.orderId).toBe('order_test123');
      expect(result.amount).toBe(299900);
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
    const orderId = 'order_1';
    const paymentId = 'pay_1';
    const sigFor = (oid: string, pid: string) =>
      crypto
        .createHmac('sha256', 'test_secret_123')
        .update(`${oid}|${pid}`)
        .digest('hex');

    it('throws NotFoundException if payment not found', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      await expect(
        service.verifyPayment(userId, {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: 'sig',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if payment belongs to another user', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        userId: 'user-2',
        status: 'PENDING',
      });
      await expect(
        service.verifyPayment(userId, {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: 'sig',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('marks payment as FAILED on invalid signature without throwing if already finalized', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        userId,
        status: 'PENDING',
        courseId: 'course-1',
      });
      mockPrismaService.payment.updateMany.mockResolvedValue({ count: 1 });

      await expect(
        service.verifyPayment(userId, {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: 'invalid_signature',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.payment.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { orderId, status: 'PENDING' },
          data: { status: 'FAILED' },
        }),
      );
    });

    it('claims a PENDING payment and runs side-effects exactly once (with coupon)', async () => {
      mockPrismaService.payment.findUnique
        .mockResolvedValueOnce({
          userId,
          status: 'PENDING',
          courseId: 'course-1',
          couponCode: 'SAVE20',
        })
        .mockResolvedValueOnce({
          id: 'payment-1',
          orderId,
          paymentId,
          amount: 2399,
          status: 'PAID',
        });
      mockPrismaService.payment.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.verifyPayment(userId, {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: sigFor(orderId, paymentId),
      });

      expect(result.message).toBe('Payment verified and enrolled successfully');
      expect(result.payment?.status).toBe('PAID');
      expect(txMock.enrollment.upsert).toHaveBeenCalledTimes(1);
      // Coupon applied → exactly one increment.
      expect(txMock.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it('returns idempotent success when the row was already claimed (race with webhook)', async () => {
      mockPrismaService.payment.findUnique
        .mockResolvedValueOnce({
          userId,
          status: 'PENDING',
          courseId: 'course-1',
          couponCode: 'SAVE20',
        })
        .mockResolvedValueOnce({
          id: 'payment-1',
          orderId,
          paymentId,
          amount: 2399,
          status: 'PAID',
        });
      // The other writer (the webhook) won the race.
      mockPrismaService.payment.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.verifyPayment(userId, {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: sigFor(orderId, paymentId),
      });

      expect(result.message).toBe('Payment already verified');
      // Critically: side-effects MUST NOT run on the loser.
      expect(txMock.enrollment.upsert).not.toHaveBeenCalled();
      expect(txMock.$executeRaw).not.toHaveBeenCalled();
    });
  });

  // ─── applyCoupon ────────────────────────────────────

  describe('applyCoupon', () => {
    it('throws NotFoundException for invalid coupon code', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue(null);
      await expect(
        service.applyCoupon('INVALID', 'course-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException for inactive coupon', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue({
        code: 'INACTIVE',
        isActive: false,
      });
      await expect(
        service.applyCoupon('INACTIVE', 'course-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for expired coupon', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue({
        code: 'EXPIRED',
        isActive: true,
        expiresAt: new Date('2020-01-01'),
      });
      await expect(
        service.applyCoupon('EXPIRED', 'course-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when max uses reached', async () => {
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

    it('returns valid discount for a valid coupon WITHOUT incrementing usedCount', async () => {
      mockPrismaService.coupon.findUnique.mockResolvedValue({
        code: 'SAVE20',
        isActive: true,
        expiresAt: null,
        maxUses: 100,
        usedCount: 5,
        discountPercent: 20,
      });
      mockPrismaService.course.findFirst.mockResolvedValue({
        id: 'course-1',
        price: 2999,
      });

      const result = await service.applyCoupon('SAVE20', 'course-1');

      expect(result.valid).toBe(true);
      expect(result.code).toBe('SAVE20');
      expect(result.discount).toBe(600);
      expect(result.finalPrice).toBe(2399);
      // The fix: preview must not bump usedCount.
      expect(txMock.$executeRaw).not.toHaveBeenCalled();
    });
  });

  // ─── handleWebhook ──────────────────────────────────

  describe('handleWebhook', () => {
    const webhookSecret = 'webhook_secret_456';
    const signRaw = (raw: Buffer) =>
      crypto.createHmac('sha256', webhookSecret).update(raw).digest('hex');

    it('throws BadRequestException on invalid webhook signature', async () => {
      const raw = Buffer.from(
        JSON.stringify({ event: 'payment.captured', payload: {} }),
      );
      await expect(
        service.handleWebhook(raw, 'invalid_signature'),
      ).rejects.toThrow(BadRequestException);
    });

    it('returns ignored if no payment entity in payload', async () => {
      const raw = Buffer.from(
        JSON.stringify({ event: 'payment.captured', payload: {} }),
      );
      const result = await service.handleWebhook(raw, signRaw(raw));
      expect(result.status).toBe('ignored');
    });

    it('processes payment.captured idempotently (no double-enroll/double-coupon)', async () => {
      const raw = Buffer.from(
        JSON.stringify({
          event: 'payment.captured',
          payload: {
            payment: { entity: { id: 'pay_123', order_id: 'order_456' } },
          },
        }),
      );
      mockPrismaService.payment.findUnique
        .mockResolvedValueOnce({
          userId: 'user-1',
          courseId: 'course-1',
          status: 'PENDING',
          couponCode: 'SAVE20',
        })
        // post-claim re-read
        .mockResolvedValueOnce({
          id: 'payment-1',
          orderId: 'order_456',
          paymentId: 'pay_123',
          amount: 2399,
          status: 'PAID',
        });
      mockPrismaService.payment.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.handleWebhook(raw, signRaw(raw));
      expect(result.status).toBe('ok');
      expect(txMock.enrollment.upsert).toHaveBeenCalledTimes(1);
      expect(txMock.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it('skips side-effects if the row was already claimed', async () => {
      const raw = Buffer.from(
        JSON.stringify({
          event: 'payment.captured',
          payload: {
            payment: { entity: { id: 'pay_123', order_id: 'order_456' } },
          },
        }),
      );
      mockPrismaService.payment.findUnique
        .mockResolvedValueOnce({
          userId: 'user-1',
          courseId: 'course-1',
          status: 'PENDING',
          couponCode: 'SAVE20',
        })
        .mockResolvedValueOnce({
          id: 'payment-1',
          orderId: 'order_456',
          paymentId: 'pay_123',
          amount: 2399,
          status: 'PAID',
        });
      mockPrismaService.payment.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.handleWebhook(raw, signRaw(raw));
      expect(result.status).toBe('ok');
      expect(txMock.enrollment.upsert).not.toHaveBeenCalled();
      expect(txMock.$executeRaw).not.toHaveBeenCalled();
    });

    it('processes payment.failed event', async () => {
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
