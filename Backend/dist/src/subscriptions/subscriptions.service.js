"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SubscriptionsService = class SubscriptionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMySubscription(userId) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { userId, status: client_1.SubscriptionStatus.ACTIVE },
            orderBy: { createdAt: 'desc' },
        });
        if (!subscription) {
            return {
                plan: client_1.SubscriptionPlan.FREE,
                status: client_1.SubscriptionStatus.ACTIVE,
                isActive: true,
                message: 'You are on the Free plan',
            };
        }
        return {
            ...subscription,
            isActive: true,
        };
    }
    async subscribe(userId, plan) {
        if (plan === client_1.SubscriptionPlan.FREE) {
            throw new common_1.BadRequestException('You are already on the Free plan');
        }
        await this.prisma.subscription.updateMany({
            where: { userId, status: client_1.SubscriptionStatus.ACTIVE },
            data: { status: client_1.SubscriptionStatus.CANCELLED },
        });
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        return this.prisma.subscription.create({
            data: {
                userId,
                plan,
                status: client_1.SubscriptionStatus.ACTIVE,
                startDate: now,
                endDate: expiresAt,
            },
        });
    }
    async cancel(userId) {
        const active = await this.prisma.subscription.findFirst({
            where: { userId, status: client_1.SubscriptionStatus.ACTIVE },
        });
        if (!active) {
            throw new common_1.NotFoundException('No active subscription found');
        }
        return this.prisma.subscription.update({
            where: { id: active.id },
            data: { status: client_1.SubscriptionStatus.CANCELLED },
        });
    }
    async findAll() {
        return this.prisma.subscription.findMany({
            include: {
                user: { select: { id: true, email: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map