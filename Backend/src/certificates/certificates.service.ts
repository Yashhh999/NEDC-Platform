import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const REQUIRED_COMPLETION_PERCENT = 100;

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async issueCertificate(userId: string, courseId: string) {
    const enrolled = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    });
    if (!enrolled) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: { include: { lessons: { select: { id: true } } } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const totalLessons = lessonIds.length;
    if (totalLessons === 0) {
      throw new ForbiddenException('Course has no lessons to complete');
    }

    const completedCount = await this.prisma.progress.count({
      where: { userId, lessonId: { in: lessonIds }, completed: true },
    });
    const percent = Math.round((completedCount / totalLessons) * 100);
    if (percent < REQUIRED_COMPLETION_PERCENT) {
      throw new ForbiddenException(
        `Course must be ${REQUIRED_COMPLETION_PERCENT}% complete (currently ${percent}%) to claim a certificate`,
      );
    }

    return this.prisma.certificate.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: {},
      create: { userId, courseId },
    });
  }

  async getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          select: { id: true, title: true, category: true, thumbnail: true },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async getAllCertificates() {
    return this.prisma.certificate.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }
}
