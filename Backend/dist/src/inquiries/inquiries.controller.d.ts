import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiryStatus } from '@prisma/client';
export declare class InquiriesController {
    private inquiriesService;
    constructor(inquiriesService: InquiriesService);
    create(dto: CreateInquiryDto): Promise<{
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
