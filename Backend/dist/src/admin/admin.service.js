"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats() {
        const [totalUsers, totalCourses, totalEnrollments, totalPayments, payments, totalCertificates, totalInquiries, newInquiries,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.course.count(),
            this.prisma.enrollment.count(),
            this.prisma.payment.count({ where: { status: client_1.PaymentStatus.PAID } }),
            this.prisma.payment.findMany({
                where: { status: client_1.PaymentStatus.PAID },
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
    async getAllPayments(status) {
        const where = status ? { status: status } : {};
        return this.prisma.payment.findMany({
            where,
            include: {
                user: { select: { id: true, email: true, name: true } },
                course: { select: { id: true, title: true, price: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAllEnrollments() {
        return this.prisma.enrollment.findMany({
            include: {
                user: { select: { id: true, email: true, name: true } },
                course: { select: { id: true, title: true, price: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getRecentActivity(limit = 10) {
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map