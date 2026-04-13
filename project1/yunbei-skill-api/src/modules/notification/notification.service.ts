import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Notification, NotificationType } from './entities/notification.entity'

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>
  ) {}

  // 创建通知
  async create(userId: number, type: NotificationType, title: string, content?: string, relatedSkillId?: number, relatedVersionId?: number): Promise<Notification> {
    const notification = this.notificationRepo.create({
      userId,
      type,
      title,
      content: content || null,
      relatedSkillId: relatedSkillId || null,
      relatedVersionId: relatedVersionId || null,
      isRead: false
    })
    return this.notificationRepo.save(notification)
  }

  // 批量创建通知（给多个用户发送相同通知）
  async createBatch(userIds: number[], type: NotificationType, title: string, content?: string, relatedSkillId?: number, relatedVersionId?: number): Promise<void> {
    const notifications = userIds.map(userId =>
      this.notificationRepo.create({
        userId,
        type,
        title,
        content: content || null,
        relatedSkillId: relatedSkillId || null,
        relatedVersionId: relatedVersionId || null,
        isRead: false
      })
    )
    await this.notificationRepo.save(notifications)
  }

  // 获取用户通知列表
  async getUserNotifications(userId: number, page: number = 1, pageSize: number = 20) {
    const qb = this.notificationRepo.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)

    const [list, total] = await qb.getManyAndCount()
    return { list, total, page, pageSize }
  }

  // 获取未读数量
  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepo.count({ where: { userId, isRead: false } })
  }

  // 标记已读
  async markAsRead(userId: number, notificationId: number): Promise<void> {
    await this.notificationRepo.update({ id: notificationId, userId }, { isRead: true })
  }

  // 标记全部已读
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepo.update({ userId, isRead: false }, { isRead: true })
  }
}