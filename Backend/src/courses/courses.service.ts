import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

// Lesson fields safe to expose to non-enrolled / unauthenticated users.
const PUBLIC_LESSON_SELECT = {
  id: true,
  title: true,
  duration: true,
  order: true,
  moduleId: true,
} as const;

// Full lesson select (including content + videoUrl) for enrolled users
// or admins.
const FULL_LESSON_SELECT = {
  id: true,
  title: true,
  content: true,
  videoUrl: true,
  duration: true,
  order: true,
  moduleId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    // Admin listing also hides soft-deleted courses by default; an admin
    // who wants the archive can call findAllIncludingDeleted (not exposed
    // yet).
    return this.prisma.course.findMany({
      where: { deletedAt: null },
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
      where: { published: true, deletedAt: null },
      include: {
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Public — no lesson content or video URLs leak.
  async findOne(id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: PUBLIC_LESSON_SELECT,
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  // Authenticated — enrolled users (or admin) get the full lesson payload.
  async findOneEnrolled(id: string, user: { id: string; role: string }) {
    const isAdmin = user.role?.toLowerCase() === 'admin';
    if (!isAdmin) {
      const enrolled = await this.prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: id } },
        select: { id: true },
      });
      if (!enrolled) {
        throw new ForbiddenException('You are not enrolled in this course');
      }
    }

    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: FULL_LESSON_SELECT,
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async findOneAdmin(id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: FULL_LESSON_SELECT,
            },
          },
          orderBy: { order: 'asc' },
        },
        enrollments: {
          include: { user: { select: { id: true, email: true, name: true } } },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async getHomepageData() {
    const [featuredCourses, totalCourses, totalEnrollments] = await Promise.all([
      this.prisma.course.findMany({
        where: { published: true, isFeatured: true, deletedAt: null },
        take: 4,
        include: { _count: { select: { enrollments: true, modules: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where: { published: true, deletedAt: null } }),
      this.prisma.enrollment.count(),
    ]);

    let courses = featuredCourses;
    if (courses.length < 4) {
      const remaining = await this.prisma.course.findMany({
        where: {
          published: true,
          deletedAt: null,
          id: { notIn: courses.map((c) => c.id) },
        },
        take: 4 - courses.length,
        include: { _count: { select: { enrollments: true, modules: true } } },
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
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
    });
    if (!course) throw new NotFoundException('Course not found');
    return this.prisma.course.update({ where: { id }, data: dto });
  }

  // Soft delete. Hard-delete is rejected by Postgres (Restrict) when there
  // are payments or certificates referencing the course; soft-delete also
  // hides the course from listings and prevents new enrollments.
  async remove(id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
    });
    if (!course) throw new NotFoundException('Course not found');
    await this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date(), published: false },
    });
    return { message: 'Course deleted successfully' };
  }

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
