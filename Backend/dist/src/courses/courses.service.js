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
let CoursesService = class CoursesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.course.findMany({
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
            where: { published: true },
            include: {
                _count: { select: { enrollments: true, modules: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    include: { lessons: { orderBy: { order: 'asc' } } },
                    orderBy: { order: 'asc' },
                },
                enrollments: {
                    include: {
                        user: { select: { id: true, email: true, name: true } },
                    },
                },
                _count: { select: { enrollments: true } },
            },
        });
        if (!course) {
            throw new common_1.NotFoundException('Course not found');
        }
        return course;
    }
    async create(dto) {
        return this.prisma.course.create({ data: dto });
    }
    async update(id, dto) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        return this.prisma.course.update({ where: { id }, data: dto });
    }
    async remove(id) {
        const course = await this.prisma.course.findUnique({ where: { id } });
        if (!course)
            throw new common_1.NotFoundException('Course not found');
        await this.prisma.course.delete({ where: { id } });
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