import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionPlan } from '@prisma/client';
export declare class SubscriptionsController {
    private subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getMySubscription(user: {
        id: string;
    }): Promise<{
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
    subscribe(user: {
        id: string;
    }, plan: SubscriptionPlan): Promise<void>;
    cancel(user: {
        id: string;
    }): Promise<{
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
