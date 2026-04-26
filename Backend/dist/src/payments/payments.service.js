"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const Razorpay = require('razorpay');
let PaymentsService = class PaymentsService {
    prisma;
    configService;
    razorpay;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const keyId = this.configService.get('RAZORPAY_KEY_ID');
        const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
        if (keyId && keySecret) {
            this.razorpay = new Razorpay({
                key_id: keyId,
                key_secret: keySecret,
            });
        }
    }
    async createOrder(userId, dto) {
        const course = await this.prisma.course.findUnique({
            where: { id: dto.courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        const existingEnrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: dto.courseId,
                },
            },
        });
        if (existingEnrollment) {
            throw new common_1.ConflictException('Already enrolled in this course');
        }
        const pendingPayment = await this.prisma.payment.findFirst({
            where: {
                userId,
                courseId: dto.courseId,
                status: client_1.PaymentStatus.PENDING,
            },
        });
        if (pendingPayment) {
            return {
                orderId: pendingPayment.orderId,
                amount: pendingPayment.amount,
                currency: pendingPayment.currency,
                courseTitle: course.title,
                key: this.configService.get('RAZORPAY_KEY_ID'),
            };
        }
        if (!this.razorpay) {
            throw new common_1.BadRequestException('Payment gateway is not configured. Please add Razorpay API keys.');
        }
        let finalPrice = course.price;
        let couponCode = null;
        if (dto.couponCode) {
            const couponResult = await this.applyCoupon(dto.couponCode, dto.courseId);
            finalPrice = couponResult.finalPrice;
            couponCode = couponResult.code;
        }
        const amountInPaise = Math.round(finalPrice * 100);
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
        await this.prisma.payment.create({
            data: {
                userId,
                courseId: dto.courseId,
                orderId: razorpayOrder.id,
                amount: finalPrice,
                currency: 'INR',
                status: client_1.PaymentStatus.PENDING,
                couponCode,
            },
        });
        return {
            orderId: razorpayOrder.id,
            amount: amountInPaise,
            currency: 'INR',
            courseTitle: course.title,
            key: this.configService.get('RAZORPAY_KEY_ID'),
        };
    }
    async verifyPayment(userId, dto) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = dto;
        const payment = await this.prisma.payment.findUnique({
            where: { orderId: razorpay_order_id },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment order not found');
        }
        if (payment.userId !== userId) {
            throw new common_1.BadRequestException('Payment does not belong to this user');
        }
        if (payment.status === client_1.PaymentStatus.PAID) {
            throw new common_1.ConflictException('Payment already verified');
        }
        const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
        if (!keySecret) {
            throw new common_1.BadRequestException('Payment gateway is not configured');
        }
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');
        if (expectedSignature !== razorpay_signature) {
            await this.prisma.payment.update({
                where: { orderId: razorpay_order_id },
                data: { status: client_1.PaymentStatus.FAILED },
            });
            throw new common_1.BadRequestException('Invalid payment signature');
        }
        const transactionOps = [
            this.prisma.payment.update({
                where: { orderId: razorpay_order_id },
                data: {
                    paymentId: razorpay_payment_id,
                    status: client_1.PaymentStatus.PAID,
                },
            }),
            this.prisma.enrollment.create({
                data: {
                    userId: payment.userId,
                    courseId: payment.courseId,
                },
            }),
        ];
        if (payment.couponCode) {
            transactionOps.push(this.prisma.coupon.update({
                where: { code: payment.couponCode },
                data: { usedCount: { increment: 1 } },
            }));
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
    async getMyPayments(userId) {
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
    async handleWebhook(body, signature) {
        const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new common_1.BadRequestException('Webhook secret not configured');
        }
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(body))
            .digest('hex');
        if (expectedSignature !== signature) {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        const event = body.event;
        const payload = body.payload?.payment?.entity;
        if (!payload)
            return { status: 'ignored' };
        if (event === 'payment.captured') {
            const orderId = payload.order_id;
            const payment = await this.prisma.payment.findUnique({
                where: { orderId },
            });
            if (payment && payment.status !== client_1.PaymentStatus.PAID) {
                const transactionOps = [
                    this.prisma.payment.update({
                        where: { orderId },
                        data: {
                            paymentId: payload.id,
                            status: client_1.PaymentStatus.PAID,
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
                if (payment.couponCode) {
                    transactionOps.push(this.prisma.coupon.update({
                        where: { code: payment.couponCode },
                        data: { usedCount: { increment: 1 } },
                    }));
                }
                await this.prisma.$transaction(transactionOps);
            }
        }
        else if (event === 'payment.failed') {
            const orderId = payload.order_id;
            await this.prisma.payment.updateMany({
                where: { orderId, status: client_1.PaymentStatus.PENDING },
                data: { status: client_1.PaymentStatus.FAILED },
            });
        }
        return { status: 'ok' };
    }
    async applyCoupon(code, courseId) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });
        if (!coupon) {
            throw new common_1.NotFoundException('Invalid coupon code');
        }
        if (!coupon.isActive) {
            throw new common_1.BadRequestException('This coupon is no longer active');
        }
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            throw new common_1.BadRequestException('This coupon has expired');
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            throw new common_1.BadRequestException('This coupon has reached its usage limit');
        }
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        const discount = (course.price * coupon.discountPercent) / 100;
        const finalPrice = Math.max(0, course.price - discount);
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map