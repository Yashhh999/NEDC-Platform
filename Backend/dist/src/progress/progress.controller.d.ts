import { ProgressService } from './progress.service';
export declare class ProgressController {
    private progressService;
    constructor(progressService: ProgressService);
    markComplete(user: {
        id: string;
    }, lessonId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        lessonId: string;
        completed: boolean;
        completedAt: Date | null;
    }>;
    getCourseProgress(user: {
        id: string;
    }, courseId: string): Promise<{
        courseId: string;
        totalLessons: number;
        completedLessons: number;
        percentage: number;
    } | null>;
    getUserProgress(user: {
        id: string;
    }): Promise<{
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
