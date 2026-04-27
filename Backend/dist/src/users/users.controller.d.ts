import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
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
    }, dto: UpdateProfileDto): Promise<{
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
    update(actor: {
        id: string;
        role: string;
    }, id: string, dto: AdminUpdateUserDto): Promise<{
        name: string | null;
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(actor: {
        id: string;
    }, id: string): Promise<{
        message: string;
    }>;
}
