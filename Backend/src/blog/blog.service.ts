import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async findAllPublished() {
    return this.prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async create(data: { title: string; slug: string; content: string; excerpt?: string; coverImage?: string; authorName?: string; published?: boolean }) {
    return this.prisma.blogPost.create({ data });
  }

  async update(id: string, data: Partial<{ title: string; slug: string; content: string; excerpt: string; coverImage: string; authorName: string; published: boolean }>) {
    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.blogPost.delete({ where: { id } });
    return { message: 'Blog post deleted' };
  }
}
