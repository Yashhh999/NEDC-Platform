import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
export declare class EnrollmentsController {
    private enrollmentsService;
    constructor(enrollmentsService: EnrollmentsService);
    enroll(user: {
        id: string;
        email: string;
        role: string;
    }, dto: CreateEnrollmentDto): Promise<{
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
                deletedAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            courseId: string;
        };
    }>;
    getMyEnrollments(user: {
        id: string;
        email: string;
        role: string;
    }): Promise<({
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
            deletedAt: Date | null;
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
}
