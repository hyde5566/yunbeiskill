import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';
export declare class NotificationService {
    private notificationRepository;
    constructor(notificationRepository: Repository<Notification>);
    create(userId: number, type: string, title: string, content: string, relatedSkillId?: number, relatedVersionId?: number): Promise<Notification>;
    batchCreate(userIds: number[], type: string, title: string, content: string, relatedSkillId?: number, relatedVersionId?: number): Promise<Notification[]>;
    getMyNotifications(userId: number, pagination: PaginationDto): Promise<PaginatedResult<Notification>>;
    getUnreadCount(userId: number): Promise<number>;
    markAsRead(id: number, userId: number): Promise<void>;
    markAllAsRead(userId: number): Promise<void>;
    remove(id: number, userId: number): Promise<void>;
}
