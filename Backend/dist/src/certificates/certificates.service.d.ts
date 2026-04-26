import { PrismaService } from '../prisma/prisma.service';
export declare class CertificatesService {
    private prisma;
    constructor(prisma: PrismaService);
    issueCertificate(userId: string, courseId: string): Promise<{
        id: string;
        userId: string;
        courseId: string;
        certificateUrl: string | null;
        issuedAt: Date;
    }>;
    getUserCertificates(userId: string): Promise<({
        course: {
            id: string;
            title: string;
            thumbnail: string | null;
            category: string | null;
        };
    } & {
        id: string;
        userId: string;
        courseId: string;
        certificateUrl: string | null;
        issuedAt: Date;
    })[]>;
    getAllCertificates(): Promise<({
        user: {
            name: string | null;
            email: string;
            id: string;
        };
        course: {
            id: string;
            title: string;
        };
    } & {
        id: string;
        userId: string;
        courseId: string;
        certificateUrl: string | null;
        issuedAt: Date;
    })[]>;
}
