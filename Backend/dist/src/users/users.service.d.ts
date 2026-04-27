import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
        enrollments: ({
            course: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                description: string | null;
                price: number;
                thumbnail: string | null;
                category: string | null;
                duration: string | null;
                isFeatured: boolean;
                isBestseller: boolean;
                published: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            courseId: string;
        })[];
    }>;
    getProfile(userId: string): Promise<{
        totalEnrollments: number;
        totalPayments: number;
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
        enrollments: ({
            course: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                description: string | null;
                price: number;
                thumbnail: string | null;
                category: string | null;
                duration: string | null;
                isFeatured: boolean;
                isBestseller: boolean;
                published: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            courseId: string;
        })[];
        payments: {
            course: {
                id: string;
                title: string;
            };
            id: string;
            createdAt: Date;
            amount: number;
            status: import(".prisma/client").$Enums.PaymentStatus;
        }[];
    }>;
    updateProfile(userId: string, data: {
        email?: string;
        name?: string;
        phone?: string;
        avatar?: string;
    }): Promise<{
        name: string | null;
        email: string;
        phone: string | null;
        id: string;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: {
        email?: string;
        role?: Role;
    }): Promise<{
        name: string | null;
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
