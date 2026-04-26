import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async issueCertificate(userId: string, courseId: string) {
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
        course: { select: { id: true, title: true, category: true, thumbnail: true } },
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
