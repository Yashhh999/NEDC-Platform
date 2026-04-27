import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiryStatus } from '@prisma/client';
export declare class InquiriesController {
    private inquiriesService;
    constructor(inquiriesService: InquiriesService);
    create(dto: CreateInquiryDto): Promise<{
        name: string;
        email: string;
        message: string;
        phone: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InquiryStatus;
    }>;
    findAll(status?: InquiryStatus): Promise<{
        name: string;
        email: string;
        message: string;
        phone: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InquiryStatus;
    }[]>;
    updateStatus(id: string, status: InquiryStatus): Promise<{
        name: string;
        email: string;
        message: string;
        phone: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InquiryStatus;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
