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
exports.BlogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BlogService = class BlogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllPublished() {
        return this.prisma.blogPost.findMany({
            where: { published: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAll() {
        return this.prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async findBySlug(slug) {
        const post = await this.prisma.blogPost.findUnique({ where: { slug } });
        if (!post)
            throw new common_1.NotFoundException('Blog post not found');
        return post;
    }
    async create(data) {
        return this.prisma.blogPost.create({ data });
    }
    async update(id, data) {
        return this.prisma.blogPost.update({ where: { id }, data });
    }
    async remove(id) {
        await this.prisma.blogPost.delete({ where: { id } });
        return { message: 'Blog post deleted' };
    }
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlogService);
//# sourceMappingURL=blog.service.js.map