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
exports.EnrollmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EnrollmentsService = class EnrollmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async enroll(userId, dto) {
        const course = await this.prisma.course.findUnique({
            where: { id: dto.courseId },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        const existing = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: dto.courseId,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Already enrolled in this course');
        }
        const enrollment = await this.prisma.enrollment.create({
            data: {
                userId,
                courseId: dto.courseId,
            },
            include: {
                course: true,
            },
        });
        return {
            message: 'Enrolled successfully',
            enrollment,
        };
    }
    async getMyEnrollments(userId) {
        const enrollments = await this.prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return enrollments;
    }
    async getAllEnrollments() {
        return this.prisma.enrollment.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async isEnrolled(userId, courseId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId },
            },
        });
        return !!enrollment;
    }
};
exports.EnrollmentsService = EnrollmentsService;
exports.EnrollmentsService = EnrollmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EnrollmentsService);
//# sourceMappingURL=enrollments.service.js.map