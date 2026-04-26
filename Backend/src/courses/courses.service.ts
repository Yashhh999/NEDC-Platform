import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

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

  // Public endpoint — no user enrollment data (privacy + performance)
  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: { lessons: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  // Admin-only — includes enrollment details with user info
  async findOneAdmin(id: string) {
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

  // ─── Homepage Data (public) ─────────────────────────────
  async getHomepageData() {
    const [featuredCourses, totalCourses, totalEnrollments] = await Promise.all(
      [
        this.prisma.course.findMany({
          where: { published: true, isFeatured: true },
          take: 4,
          include: {
            _count: { select: { enrollments: true, modules: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.course.count({ where: { published: true } }),
        this.prisma.enrollment.count(),
      ],
    );

    // If fewer than 4 featured, backfill with bestsellers or recent
    let courses = featuredCourses;
    if (courses.length < 4) {
      const remaining = await this.prisma.course.findMany({
        where: {
          published: true,
          id: { notIn: courses.map((c) => c.id) },
        },
        take: 4 - courses.length,
        include: {
          _count: { select: { enrollments: true, modules: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      courses = [...courses, ...remaining];
    }

    return {
      courses,
      stats: {
        totalCourses,
        totalLearners: totalEnrollments,
      },
    };
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

  async updateLesson(id: string, data: UpdateLessonDto) {
    return this.prisma.lesson.update({ where: { id }, data });
  }

  async deleteLesson(id: string) {
    await this.prisma.lesson.delete({ where: { id } });
    return { message: 'Lesson deleted' };
  }
}
