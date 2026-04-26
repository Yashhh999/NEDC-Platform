import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ─── Dashboard Stats ──────────────────────────────────
  async getDashboardStats() {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalPayments,
      payments,
      totalCertificates,
      totalInquiries,
      newInquiries,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.enrollment.count(),
      this.prisma.payment.count({ where: { status: PaymentStatus.PAID } }),
      this.prisma.payment.findMany({
        where: { status: PaymentStatus.PAID },
        select: { amount: true },
      }),
      this.prisma.certificate.count(),
      this.prisma.inquiry.count(),
      this.prisma.inquiry.count({ where: { status: 'NEW' } }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalPayments,
      totalRevenue,
      totalCertificates,
      totalInquiries,
      newInquiries,
      currency: 'INR',
    };
  }

  // ─── All Payments with details ────────────────────────
  async getAllPayments(status?: string) {
    const where = status ? { status: status as PaymentStatus } : {};

    return this.prisma.payment.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, name: true } },
        course: { select: { id: true, title: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── All Enrollments with details ─────────────────────
  async getAllEnrollments() {
    return this.prisma.enrollment.findMany({
      include: {
        user: { select: { id: true, email: true, name: true } },
        course: { select: { id: true, title: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Recent Activity ──────────────────────────────────
  async getRecentActivity(limit: number = 10) {
    const [recentEnrollments, recentPayments, recentUsers] = await Promise.all([
      this.prisma.enrollment.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, name: true } },
          course: { select: { title: true } },
        },
      }),
      this.prisma.payment.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, name: true } },
          course: { select: { title: true } },
        },
      }),
      this.prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      recentEnrollments,
      recentPayments,
      recentUsers,
    };
  }
}
