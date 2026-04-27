import { PrismaService } from '../prisma/prisma.service';
export declare class ProgressService {
    private prisma;
    constructor(prisma: PrismaService);
    markLessonComplete(userId: string, lessonId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        completed: boolean;
        completedAt: Date | null;
        lessonId: string;
    }>;
    getCourseProgress(userId: string, courseId: string): Promise<{
        courseId: string;
        totalLessons: number;
        completedLessons: number;
        percentage: number;
    }>;
    getUserProgress(userId: string): Promise<{
        courseId: string;
        course: {
            modules: ({
                lessons: {
                    id: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                courseId: string;
                title: string;
                order: number;
            })[];
        } & {
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
        totalLessons: number;
        completedLessons: number;
        percentage: number;
    }[]>;
    private assertEnrolled;
}
