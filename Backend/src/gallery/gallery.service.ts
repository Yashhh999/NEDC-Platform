import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GalleryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.galleryItem.findMany({ orderBy: { order: 'asc' } });
  }

  async create(data: { title?: string; imageUrl: string; description?: string; order?: number }) {
    return this.prisma.galleryItem.create({ data });
  }

  async update(id: string, data: Partial<{ title: string; imageUrl: string; description: string; order: number }>) {
    return this.prisma.galleryItem.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.galleryItem.delete({ where: { id } });
    return { message: 'Gallery item deleted' };
  }
}
