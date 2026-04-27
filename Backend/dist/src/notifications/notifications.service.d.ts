import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: {
        title: string;
        message: string;
        type?: NotificationType;
    }): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        type: import(".prisma/client").$Enums.NotificationType;
        read: boolean;
    }>;
    getUserNotifications(userId: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        type: import(".prisma/client").$Enums.NotificationType;
        read: boolean;
    }[]>;
    markAsRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUnreadCount(userId: string): Promise<{
        unreadCount: number;
    }>;
}
