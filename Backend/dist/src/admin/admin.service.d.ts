import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalCourses: number;
        totalEnrollments: number;
        totalPayments: number;
        totalRevenue: number;
        totalCertificates: number;
        totalInquiries: number;
        newInquiries: number;
        currency: string;
    }>;
    getAllPayments(status?: string): Promise<({
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
        amount: number;
        currency: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
    })[]>;
    getAllEnrollments(): Promise<({
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
        userId: string;
        courseId: string;
    })[]>;
    getRecentActivity(limit?: number): Promise<{
        recentEnrollments: ({
            user: {
                name: string | null;
                email: string;
            };
            course: {
                title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            courseId: string;
        })[];
        recentPayments: ({
            user: {
                name: string | null;
                email: string;
            };
            course: {
                title: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            courseId: string;
            orderId: string;
            paymentId: string | null;
            amount: number;
            currency: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
        })[];
        recentUsers: {
            name: string | null;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
        }[];
    }>;
}
