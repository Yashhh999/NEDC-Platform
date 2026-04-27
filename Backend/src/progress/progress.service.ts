import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async markLessonComplete(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, module: { select: { courseId: true } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    await this.assertEnrolled(userId, lesson.module.courseId);

    return this.prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed: true, completedAt: new Date() },
      create: { userId, lessonId, completed: true, completedAt: new Date() },
    });
  }

  async getCourseProgress(userId: string, courseId: string) {
    await this.assertEnrolled(userId, courseId);

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: { lessons: { select: { id: true } } },
        },
      },
    });

    if (!course) throw new NotFoundException('Course not found');

    const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const totalLessons = allLessonIds.length;

    if (totalLessons === 0) {
      return { courseId, totalLessons: 0, completedLessons: 0, percentage: 0 };
    }

    const completedLessons = await this.prisma.progress.count({
      where: { userId, lessonId: { in: allLessonIds }, completed: true },
    });

    return {
      courseId,
      totalLessons,
      completedLessons,
      percentage: Math.round((completedLessons / totalLessons) * 100),
    };
  }

  async getUserProgress(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: { select: { id: true } } },
            },
          },
        },
      },
    });

    const lessonIdsByCourse: Record<string, string[]> = {};
    const allLessonIds: string[] = [];

    for (const enrollment of enrollments) {
      const ids = enrollment.course.modules.flatMap((m) =>
        m.lessons.map((l) => l.id),
      );
      lessonIdsByCourse[enrollment.courseId] = ids;
      allLessonIds.push(...ids);
    }

    const completedRecords =
      allLessonIds.length > 0
        ? await this.prisma.progress.findMany({
            where: { userId, lessonId: { in: allLessonIds }, completed: true },
            select: { lessonId: true },
          })
        : [];

    const completedSet = new Set(completedRecords.map((r) => r.lessonId));

    return enrollments.map((enrollment) => {
      const lessonIds = lessonIdsByCourse[enrollment.courseId] || [];
      const totalLessons = lessonIds.length;
      const completedLessons = lessonIds.filter((id) => completedSet.has(id)).length;
      const percentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        courseId: enrollment.courseId,
        course: enrollment.course,
        totalLessons,
        completedLessons,
        percentage,
      };
    });
  }

  private async assertEnrolled(userId: string, courseId: string) {
    const enrolled = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });
    if (!enrolled) {
      throw new ForbiddenException('You are not enrolled in this course');
    }
  }
}
