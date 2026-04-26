import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InquiryStatus } from '@prisma/client';

@Injectable()
export class InquiriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; email: string; phone?: string; message: string }) {
    return this.prisma.inquiry.create({ data });
  }

  async findAll(status?: InquiryStatus) {
    const where = status ? { status } : {};
    return this.prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: InquiryStatus) {
    return this.prisma.inquiry.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string) {
    await this.prisma.inquiry.delete({ where: { id } });
    return { message: 'Inquiry deleted' };
  }
}
