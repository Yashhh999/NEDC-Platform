import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    getUserNotifications(user: {
        id: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        message: string;
        type: import(".prisma/client").$Enums.NotificationType;
        read: boolean;
    }[]>;
    getUnreadCount(user: {
        id: string;
    }): Promise<{
        unreadCount: number;
    }>;
    markAsRead(user: {
        id: string;
    }, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(user: {
        id: string;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
