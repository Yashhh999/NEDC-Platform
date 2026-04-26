import { PrismaService } from '../prisma/prisma.service';
export declare class GalleryService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        title: string | null;
        description: string | null;
        order: number;
        imageUrl: string;
    }[]>;
    create(data: {
        title?: string;
        imageUrl: string;
        description?: string;
        order?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        title: string | null;
        description: string | null;
        order: number;
        imageUrl: string;
    }>;
    update(id: string, data: Partial<{
        title: string;
        imageUrl: string;
        description: string;
        order: number;
    }>): Promise<{
        id: string;
        createdAt: Date;
        title: string | null;
        description: string | null;
        order: number;
        imageUrl: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
