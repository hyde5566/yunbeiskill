import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Notification } from './entities/notification.entity'
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  // 创建通知
  async create(userId: number, type: string, title: string, content: string, relatedSkillId?: number, relatedVersionId?: number) {
    const notification = this.notificationRepository.create({
      user_id: userId,
      type,
      title,
      content,
      related_skill_id: relatedSkillId,
      related_version_id: relatedVersionId,
    })
    return this.notificationRepository.save(notification)
  }

  // 批量创建通知（版本更新时）
  async batchCreate(userIds: number[], type: string, title: string, content: string, relatedSkillId?: number, relatedVersionId?: number) {
    const notifications = userIds.map((userId) =>
      this.notificationRepository.create({
        user_id: userId,
        type,
        title,
        content,
        related_skill_id: relatedSkillId,
        related_version_id: relatedVersionId,
      }),
    )
    return this.notificationRepository.save(notifications)
  }

  // 获取用户通知列表
  async getMyNotifications(userId: number, pagination: PaginationDto) {
    const [list, total] = await this.notificationRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: pagination.skip,
      take: pagination.take,
    })
    return new PaginatedResult(list, total, pagination.page, pagination.pageSize)
  }

  // 获取未读数量
  async getUnreadCount(userId: number) {
    return this.notificationRepository.count({
      where: { user_id: userId, is_read: 0 },
    })
  }

  // 标记已读
  async markAsRead(id: number, userId: number) {
    await this.notificationRepository.update(
      { id, user_id: userId },
      { is_read: 1 },
    )
  }

  // 全部标记已读
  async markAllAsRead(userId: number) {
    await this.notificationRepository.update(
      { user_id: userId, is_read: 0 },
      { is_read: 1 },
    )
  }

  // 删除通知
  async remove(id: number, userId: number) {
    await this.notificationRepository.delete({ id, user_id: userId })
  }
}
