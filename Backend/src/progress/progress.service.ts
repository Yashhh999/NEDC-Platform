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
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
    });

    const progressList = await Promise.all(
      enrollments.map(async (enrollment) => {
        const progress = await this.getCourseProgress(userId, enrollment.courseId);
        return { course: enrollment.course, ...progress };
      }),
    );

    return progressList;
  }
}
