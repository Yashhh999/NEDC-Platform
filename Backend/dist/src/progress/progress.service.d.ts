import { PrismaService } from '../prisma/prisma.service';
export declare class ProgressService {
    private prisma;
    constructor(prisma: PrismaService);
    markLessonComplete(userId: string, lessonId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        lessonId: string;
        completed: boolean;
        completedAt: Date | null;
    }>;
    getCourseProgress(userId: string, courseId: string): Promise<{
        courseId: string;
        totalLessons: number;
        completedLessons: number;
        percentage: number;
    } | null>;
    getUserProgress(userId: string): Promise<{
        courseId?: string | undefined;
        totalLessons?: number | undefined;
        completedLessons?: number | undefined;
        percentage?: number | undefined;
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
    }[]>;
}
