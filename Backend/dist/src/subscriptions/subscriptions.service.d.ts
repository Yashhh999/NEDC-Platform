import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan } from '@prisma/client';
export declare class SubscriptionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getMySubscription(userId: string): Promise<{
        plan: "FREE";
        status: "ACTIVE";
        isActive: boolean;
        message: string;
    } | {
        isActive: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        startDate: Date;
        endDate: Date | null;
        message?: undefined;
    }>;
    subscribe(userId: string, plan: SubscriptionPlan): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        startDate: Date;
        endDate: Date | null;
    }>;
    cancel(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        startDate: Date;
        endDate: Date | null;
    }>;
    findAll(): Promise<({
        user: {
            name: string | null;
            email: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        plan: import(".prisma/client").$Enums.SubscriptionPlan;
        startDate: Date;
        endDate: Date | null;
    })[]>;
}
