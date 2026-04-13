import { NotificationService } from './notification.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getMyNotifications(pagination: PaginationDto, user: any): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/notification.entity").Notification>>;
    getUnreadCount(user: any): Promise<number>;
    markAsRead(id: number, user: any): Promise<void>;
    markAllAsRead(user: any): Promise<void>;
    remove(id: number, user: any): Promise<void>;
}
