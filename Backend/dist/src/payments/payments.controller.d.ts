import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    createOrder(user: {
        id: string;
        email: string;
        role: string;
    }, dto: CreateOrderDto): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        courseTitle: string;
        key: string | undefined;
    }>;
    verifyPayment(user: {
        id: string;
        email: string;
        role: string;
    }, dto: VerifyPaymentDto): Promise<{
        message: string;
        payment: {
            id: string;
            orderId: string;
            paymentId: string | null;
            amount: number;
            status: import(".prisma/client").$Enums.PaymentStatus;
        };
    }>;
    getMyPayments(user: {
        id: string;
        email: string;
        role: string;
    }): Promise<({
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
    webhook(body: any, signature: string): Promise<{
        status: string;
    }>;
    applyCoupon(dto: ApplyCouponDto): Promise<{
        valid: boolean;
        code: string;
        discountPercent: number;
        originalPrice: number;
        discount: number;
        finalPrice: number;
        currency: string;
    }>;
}
