import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
export declare class BlogController {
    private blogService;
    constructor(blogService: BlogService);
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
    create(dto: CreateBlogPostDto): Promise<{
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
    update(id: string, dto: Partial<CreateBlogPostDto>): Promise<{
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
