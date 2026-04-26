import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(user: {
        id: string;
        email: string;
        role: string;
    }): Promise<{
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
    updateProfile(user: {
        id: string;
        email: string;
        role: string;
    }, data: {
        email?: string;
    }): Promise<{
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
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
    update(id: string, data: {
        email?: string;
        role?: string;
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
