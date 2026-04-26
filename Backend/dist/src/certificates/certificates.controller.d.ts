import { CertificatesService } from './certificates.service';
export declare class CertificatesController {
    private certificatesService;
    constructor(certificatesService: CertificatesService);
    getUserCertificates(user: {
        id: string;
    }): Promise<({
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
    issueCertificate(user: {
        id: string;
    }, courseId: string): Promise<{
        id: string;
        userId: string;
        courseId: string;
        certificateUrl: string | null;
        issuedAt: Date;
    }>;
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
