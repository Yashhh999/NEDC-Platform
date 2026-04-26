import { PrismaService } from '../prisma/prisma.service';
export declare class BlogService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllPublished(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        published: boolean;
        content: string;
        slug: string;
        excerpt: string | null;
        coverImage: string | null;
        authorName: string | null;
    }[]>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        published: boolean;
        content: string;
        slug: string;
        excerpt: string | null;
        coverImage: string | null;
        authorName: string | null;
    }[]>;
    findBySlug(slug: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        published: boolean;
        content: string;
        slug: string;
        excerpt: string | null;
        coverImage: string | null;
        authorName: string | null;
    }>;
    create(data: {
        title: string;
        slug: string;
        content: string;
        excerpt?: string;
        coverImage?: string;
        authorName?: string;
        published?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        published: boolean;
        content: string;
        slug: string;
        excerpt: string | null;
        coverImage: string | null;
        authorName: string | null;
    }>;
    update(id: string, data: Partial<{
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        coverImage: string;
        authorName: string;
        published: boolean;
    }>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        published: boolean;
        content: string;
        slug: string;
        excerpt: string | null;
        coverImage: string | null;
        authorName: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
