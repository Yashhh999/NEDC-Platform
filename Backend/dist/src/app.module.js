"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const courses_module_1 = require("./courses/courses.module");
const enrollments_module_1 = require("./enrollments/enrollments.module");
const payments_module_1 = require("./payments/payments.module");
const admin_module_1 = require("./admin/admin.module");
const progress_module_1 = require("./progress/progress.module");
const certificates_module_1 = require("./certificates/certificates.module");
const inquiries_module_1 = require("./inquiries/inquiries.module");
const notifications_module_1 = require("./notifications/notifications.module");
const blog_module_1 = require("./blog/blog.module");
const gallery_module_1 = require("./gallery/gallery.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const settings_module_1 = require("./settings/settings.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            courses_module_1.CoursesModule,
            enrollments_module_1.EnrollmentsModule,
            payments_module_1.PaymentsModule,
            admin_module_1.AdminModule,
            progress_module_1.ProgressModule,
            certificates_module_1.CertificatesModule,
            inquiries_module_1.InquiriesModule,
            notifications_module_1.NotificationsModule,
            blog_module_1.BlogModule,
            gallery_module_1.GalleryModule,
            subscriptions_module_1.SubscriptionsModule,
            settings_module_1.SettingsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map