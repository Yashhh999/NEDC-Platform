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
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const PUBLIC_LESSON_SELECT = {
    id: true,
    title: true,
    duration: true,
    order: true,
    moduleId: true,
};
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
};
let CoursesService = class CoursesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
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
    async findOne(id) {
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
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        return course;
    }
    async findOneEnrolled(id, user) {
        const isAdmin = user.role?.toLowerCase() === 'admin';
        if (!isAdmin) {
            const enrolled = await this.prisma.enrollment.findUnique({
                where: { userId_courseId: { userId: user.id, courseId: id } },
                select: { id: true },
            });
            if (!enrolled) {
                throw new common_1.ForbiddenException('You are not enrolled in this course');
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
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        return course;
    }
    async findOneAdmin(id) {
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
        if (!course)
            throw new common_1.NotFoundException('Course not found');
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
    async create(dto) {
        return this.prisma.course.create({ data: dto });
    }
    async update(id, dto) {
        const course = await this.prisma.course.findFirst({
            where: { id, deletedAt: null },
        });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        return this.prisma.course.update({ where: { id }, data: dto });
    }
    async remove(id) {
        const course = await this.prisma.course.findFirst({
            where: { id, deletedAt: null },
        });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        await this.prisma.course.update({
            where: { id },
            data: { deletedAt: new Date(), published: false },
        });
        return { message: 'Course deleted successfully' };
    }
    async createModule(dto) {
        return this.prisma.module.create({ data: dto });
    }
    async updateModule(id, data) {
        return this.prisma.module.update({ where: { id }, data });
    }
    async deleteModule(id) {
        await this.prisma.module.delete({ where: { id } });
        return { message: 'Module deleted' };
    }
    async createLesson(dto) {
        return this.prisma.lesson.create({ data: dto });
    }
    async updateLesson(id, data) {
        return this.prisma.lesson.update({ where: { id }, data });
    }
    async deleteLesson(id) {
        await this.prisma.lesson.delete({ where: { id } });
        return { message: 'Lesson deleted' };
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map