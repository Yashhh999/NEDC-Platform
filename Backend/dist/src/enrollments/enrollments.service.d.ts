import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
export declare class EnrollmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    enroll(userId: string, dto: CreateEnrollmentDto): Promise<{
        message: string;
        enrollment: {
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
        };
    }>;
    getMyEnrollments(userId: string): Promise<({
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
    })[]>;
    getAllEnrollments(): Promise<({
        user: {
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
    isEnrolled(userId: string, courseId: string): Promise<boolean>;
}
