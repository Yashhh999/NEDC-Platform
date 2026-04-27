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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ALLOWED_KEYS = new Set([
    'platform.name',
    'platform.support_email',
    'platform.support_phone',
    'notifications.email_on_enrollment',
    'notifications.email_on_inquiry',
    'notifications.weekly_report',
]);
const MAX_VALUE_LENGTH = 1000;
let SettingsService = class SettingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAll() {
        const settings = await this.prisma.setting.findMany();
        const result = {};
        for (const s of settings) {
            if (ALLOWED_KEYS.has(s.key))
                result[s.key] = s.value;
        }
        return result;
    }
    async get(key) {
        if (!ALLOWED_KEYS.has(key))
            return null;
        const setting = await this.prisma.setting.findUnique({ where: { key } });
        return setting?.value || null;
    }
    async set(key, value) {
        this.assertKey(key);
        this.assertValue(value);
        return this.prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
    }
    async setBulk(data) {
        for (const [key, value] of Object.entries(data)) {
            this.assertKey(key);
            this.assertValue(value);
        }
        const operations = Object.entries(data).map(([key, value]) => this.prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        }));
        await this.prisma.$transaction(operations);
        return { message: 'Settings updated' };
    }
    assertKey(key) {
        if (!ALLOWED_KEYS.has(key)) {
            throw new common_1.BadRequestException(`Setting key "${key}" is not allowed`);
        }
    }
    assertValue(value) {
        if (typeof value !== 'string') {
            throw new common_1.BadRequestException('Setting value must be a string');
        }
        if (value.length > MAX_VALUE_LENGTH) {
            throw new common_1.BadRequestException(`Setting value exceeds ${MAX_VALUE_LENGTH} characters`);
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map