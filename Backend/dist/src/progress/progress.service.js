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
exports.ProgressService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProgressService = class ProgressService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async markLessonComplete(userId, lessonId) {
        return this.prisma.progress.upsert({
            where: { userId_lessonId: { userId, lessonId } },
            update: { completed: true, completedAt: new Date() },
            create: { userId, lessonId, completed: true, completedAt: new Date() },
        });
    }
    async getCourseProgress(userId, courseId) {
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
        if (!course)
            return null;
        const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
        const totalLessons = allLessonIds.length;
        if (totalLessons === 0)
            return { courseId, totalLessons: 0, completedLessons: 0, percentage: 0 };
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
    async getUserProgress(userId) {
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
        const lessonIdsByCourse = {};
        const allLessonIds = [];
        for (const enrollment of enrollments) {
            const courseId = enrollment.courseId;
            const ids = enrollment.course.modules.flatMap((m) => m.lessons.map((l) => l.id));
            lessonIdsByCourse[courseId] = ids;
            allLessonIds.push(...ids);
        }
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
};
exports.ProgressService = ProgressService;
exports.ProgressService = ProgressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgressService);
//# sourceMappingURL=progress.service.js.map