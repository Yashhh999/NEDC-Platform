import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getMySubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      // Default free plan
      return {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        isActive: true,
        message: 'You are on the Free plan',
      };
    }

    // Check if subscription has expired
    if (subscription.endDate && new Date() > subscription.endDate) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: SubscriptionStatus.EXPIRED },
      });
      return {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        isActive: true,
        message: 'Your subscription has expired',
      };
    }

    return {
      ...subscription,
      isActive: true,
    };
  }

  async subscribe(userId: string, plan: SubscriptionPlan) {
    if (plan === SubscriptionPlan.FREE) {
      throw new BadRequestException('You are already on the Free plan');
    }
    // Paid plans must go through the payment flow (Razorpay) and be activated
    // by the verified-payment handler. Direct activation is forbidden because
    // it would let any authenticated user grant themselves a paid plan.
    throw new ForbiddenException(
      'Paid plans must be purchased via the billing flow.',
    );
  }

  // Internal: called from the payment-verified path or admin tools to grant
  // an active subscription. Not exposed via HTTP.
  async grantActiveSubscription(
    userId: string,
    plan: SubscriptionPlan,
    durationMonths = 1,
  ) {
    await this.prisma.subscription.updateMany({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      data: { status: SubscriptionStatus.CANCELLED },
    });

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

    return this.prisma.subscription.create({
      data: {
        userId,
        plan,
        status: SubscriptionStatus.ACTIVE,
        startDate: now,
        endDate: expiresAt,
      },
    });
  }

  async cancel(userId: string) {
    const active = await this.prisma.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });

    if (!active) {
      throw new NotFoundException('No active subscription found');
    }

    return this.prisma.subscription.update({
      where: { id: active.id },
      data: { status: SubscriptionStatus.CANCELLED },
    });
  }

  // Admin: all subscriptions
  async findAll() {
    return this.prisma.subscription.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
