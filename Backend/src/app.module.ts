import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { ProgressModule } from './progress/progress.module';
import { CertificatesModule } from './certificates/certificates.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BlogModule } from './blog/blog.module';
import { GalleryModule } from './gallery/gallery.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute window
        limit: 100, // max 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    EnrollmentsModule,
    PaymentsModule,
    AdminModule,
    ProgressModule,
    CertificatesModule,
    InquiriesModule,
    NotificationsModule,
    BlogModule,
    GalleryModule,
    SubscriptionsModule,
    SettingsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
