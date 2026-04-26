import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async markLessonComplete(userId: string, lessonId: string) {
    return this.prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed: true, completedAt: new Date() },
      create: { userId, lessonId, completed: true, completedAt: new Date() },
    });
  }

  async getCourseProgress(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: { select: { id: true } },
          },
        },
      },
    });

    if (!course) return null;

    const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const totalLessons = allLessonIds.length;

    if (totalLessons === 0) return { courseId, totalLessons: 0, completedLessons: 0, percentage: 0 };

    const completedLessons = await this.prisma.progress.count({
      where: {
        userId,
        lessonId: { in: allLessonIds },
        completed: true,
      },
    });

    return {
      courseId,
      totalLessons,
      completedLessons,
      percentage: Math.round((completedLessons / totalLessons) * 100),
    };
  }

  async getUserProgress(userId: string) {
    // Fetch all enrollments with course + lesson IDs in one query
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: { select: { id: true } },
              },
            },
          },
        },
      },
    });

    // Collect all lessonIds across all enrolled courses
    const lessonIdsByCourse: Record<string, string[]> = {};
    const allLessonIds: string[] = [];

    for (const enrollment of enrollments) {
      const courseId = enrollment.courseId;
      const ids = enrollment.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
      lessonIdsByCourse[courseId] = ids;
      allLessonIds.push(...ids);
    }

    // Single DB call to get all completed lessons for this user
    const completedRecords = allLessonIds.length > 0
      ? await this.prisma.progress.findMany({
          where: {
            userId,
            lessonId: { in: allLessonIds },
            completed: true,
          },
          select: { lessonId: true },
        })
      : [];

    const completedSet = new Set(completedRecords.map((r) => r.lessonId));

    // Compute per-course progress in JS
    return enrollments.map((enrollment) => {
      const courseId = enrollment.courseId;
      const lessonIds = lessonIdsByCourse[courseId] || [];
      const totalLessons = lessonIds.length;
      const completedLessons = lessonIds.filter((id) => completedSet.has(id)).length;
      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        courseId,
        course: enrollment.course,
        totalLessons,
        completedLessons,
        percentage,
      };
    });
  }
}
