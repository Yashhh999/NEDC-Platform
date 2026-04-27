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
        completed: boolean;
        completedAt: Date | null;
        lessonId: string;
    }>;
    getCourseProgress(user: {
        id: string;
    }, courseId: string): Promise<{
        courseId: string;
        totalLessons: number;
        completedLessons: number;
        percentage: number;
    }>;
    getUserProgress(user: {
        id: string;
    }): Promise<{
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
        };
        totalLessons: number;
        completedLessons: number;
        percentage: number;
    }[]>;
}
