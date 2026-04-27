import { GalleryService } from './gallery.service';
import { CreateGalleryItemDto, UpdateGalleryItemDto } from './dto/gallery-item.dto';
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
    create(dto: CreateGalleryItemDto): Promise<{
        id: string;
        createdAt: Date;
        title: string | null;
        description: string | null;
        order: number;
        imageUrl: string;
    }>;
    update(id: string, dto: UpdateGalleryItemDto): Promise<{
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
