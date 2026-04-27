import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
export declare class CoursesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        _count: {
            enrollments: number;
        };
        modules: ({
            lessons: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                duration: string | null;
                order: number;
                content: string | null;
                videoUrl: string | null;
                moduleId: string;
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
    })[]>;
    findPublished(): Promise<({
        _count: {
            enrollments: number;
            modules: number;
        };
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
    })[]>;
    findOne(id: string): Promise<{
        _count: {
            enrollments: number;
        };
        modules: ({
            lessons: {
                id: string;
                title: string;
                duration: string | null;
                order: number;
                moduleId: string;
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
    }>;
    findOneEnrolled(id: string, user: {
        id: string;
        role: string;
    }): Promise<{
        modules: ({
            lessons: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                duration: string | null;
                order: number;
                content: string | null;
                videoUrl: string | null;
                moduleId: string;
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
    }>;
    findOneAdmin(id: string): Promise<{
        enrollments: ({
            user: {
                name: string | null;
                email: string;
                id: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            courseId: string;
        })[];
        _count: {
            enrollments: number;
        };
        modules: ({
            lessons: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                duration: string | null;
                order: number;
                content: string | null;
                videoUrl: string | null;
                moduleId: string;
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
    }>;
    getHomepageData(): Promise<{
        courses: ({
            _count: {
                enrollments: number;
                modules: number;
            };
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
        })[];
        stats: {
            totalCourses: number;
            totalLearners: number;
        };
    }>;
    create(dto: CreateCourseDto): Promise<{
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
    }>;
    update(id: string, dto: UpdateCourseDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    createModule(dto: CreateModuleDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        title: string;
        order: number;
    }>;
    updateModule(id: string, data: {
        title?: string;
        order?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        courseId: string;
        title: string;
        order: number;
    }>;
    deleteModule(id: string): Promise<{
        message: string;
    }>;
    createLesson(dto: CreateLessonDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        duration: string | null;
        order: number;
        content: string | null;
        videoUrl: string | null;
        moduleId: string;
    }>;
    updateLesson(id: string, data: UpdateLessonDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        duration: string | null;
        order: number;
        content: string | null;
        videoUrl: string | null;
        moduleId: string;
    }>;
    deleteLesson(id: string): Promise<{
        message: string;
    }>;
}
