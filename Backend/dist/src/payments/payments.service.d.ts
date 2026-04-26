import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
export declare class PaymentsService {
    private prisma;
    private configService;
    private razorpay;
    constructor(prisma: PrismaService, configService: ConfigService);
    createOrder(userId: string, dto: CreateOrderDto): Promise<{
        orderId: any;
        amount: number;
        currency: string;
        courseTitle: string;
        key: string | undefined;
    }>;
    verifyPayment(userId: string, dto: VerifyPaymentDto): Promise<{
        message: string;
        payment: {
            id: any;
            orderId: any;
            paymentId: any;
            amount: any;
            status: any;
        };
    }>;
    getMyPayments(userId: string): Promise<({
        course: {
            id: string;
            title: string;
            price: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        courseId: string;
        orderId: string;
        paymentId: string | null;
        couponCode: string | null;
        amount: number;
        currency: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
    })[]>;
    getAllPayments(): Promise<({
        user: {
            name: string | null;
            email: string;
            id: string;
        };
        course: {
            id: string;
            title: string;
            price: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        courseId: string;
        orderId: string;
        paymentId: string | null;
        couponCode: string | null;
        amount: number;
        currency: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
    })[]>;
    handleWebhook(body: any, signature: string): Promise<{
        status: string;
    }>;
    applyCoupon(code: string, courseId: string): Promise<{
        valid: boolean;
        code: string;
        discountPercent: number;
        originalPrice: number;
        discount: number;
        finalPrice: number;
        currency: string;
    }>;
}
