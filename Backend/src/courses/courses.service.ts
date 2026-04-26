import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // ─── Courses ────────────────────────────────────────────

  async findAll() {
    return this.prisma.course.findMany({
      include: {
        modules: {
          include: { lessons: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublished() {
    return this.prisma.course.findMany({
      where: { published: true },
      include: {
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: { lessons: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
        enrollments: {
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  async create(dto: CreateCourseDto) {
    return this.prisma.course.create({ data: dto });
  }

  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.course.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    await this.prisma.course.delete({ where: { id } });
    return { message: 'Course deleted successfully' };
  }

  // ─── Modules ────────────────────────────────────────────

  async createModule(dto: CreateModuleDto) {
    return this.prisma.module.create({ data: dto });
  }

  async updateModule(id: string, data: { title?: string; order?: number }) {
    return this.prisma.module.update({ where: { id }, data });
  }

  async deleteModule(id: string) {
    await this.prisma.module.delete({ where: { id } });
    return { message: 'Module deleted' };
  }

  // ─── Lessons ────────────────────────────────────────────

  async createLesson(dto: CreateLessonDto) {
    return this.prisma.lesson.create({ data: dto });
  }

  async updateLesson(id: string, data: { title?: string; content?: string; videoUrl?: string; duration?: string; order?: number }) {
    return this.prisma.lesson.update({ where: { id }, data });
  }

  async deleteLesson(id: string) {
    await this.prisma.lesson.delete({ where: { id } });
    return { message: 'Lesson deleted' };
  }
}
