import { GalleryService } from './gallery.service';
export declare class GalleryController {
    private galleryService;
    constructor(galleryService: GalleryService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        title: string | null;
        description: string | null;
        order: number;
        imageUrl: string;
    }[]>;
    create(data: any): Promise<{
        id: string;
        createdAt: Date;
        title: string | null;
        description: string | null;
        order: number;
        imageUrl: string;
    }>;
    update(id: string, data: any): Promise<{
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
