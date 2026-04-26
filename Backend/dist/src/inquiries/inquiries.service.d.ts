import { PrismaService } from '../prisma/prisma.service';
import { InquiryStatus } from '@prisma/client';
export declare class InquiriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        email: string;
        phone?: string;
        message: string;
    }): Promise<{
        name: string;
        email: string;
        phone: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InquiryStatus;
        message: string;
    }>;
    findAll(status?: InquiryStatus): Promise<{
        name: string;
        email: string;
        phone: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InquiryStatus;
        message: string;
    }[]>;
    updateStatus(id: string, status: InquiryStatus): Promise<{
        name: string;
        email: string;
        phone: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InquiryStatus;
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
