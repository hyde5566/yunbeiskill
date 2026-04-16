import { Injectable, NotFoundException } from "@nestjs/common";
import { NotificationType, Prisma, UserStatus } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { QueryNotificationsDto } from "./dto/query-notifications.dto";

interface CurrentUserPayload {
  sub: string;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async createSkillVersionReleasedNotifications(input: {
    skillSeriesId: string;
    skillId: string;
    skillName: string;
    versionLabel: string;
    changelog: string;
    tx?: Prisma.TransactionClient;
  }) {
    const db = input.tx ?? this.prisma;

    const downloaders = await db.skillDownloadRecord.findMany({
      where: {
        seriesId: input.skillSeriesId,
        downloader: {
          status: UserStatus.ACTIVE,
        },
      },
      select: {
        downloaderId: true,
      },
      distinct: ["downloaderId"],
    });

    if (downloaders.length === 0) {
      return 0;
    }

    const title = `Skill 新版本已发布：${input.skillName} ${input.versionLabel}`;
    const changelogSummary = this.toChangelogSummary(input.changelog);
    const content = `Skill《${input.skillName}》已发布新版本 ${input.versionLabel}。更新说明：${changelogSummary}。请前往 Skill 详情下载最新版本。`;

    const result = await db.notification.createMany({
      data: downloaders.map((downloader) => ({
        userId: downloader.downloaderId,
        type: NotificationType.SKILL_VERSION_RELEASED,
        title,
        content,
        skillSeriesId: input.skillSeriesId,
        skillId: input.skillId,
        versionLabel: input.versionLabel,
      })),
    });

    return result.count;
  }

  async findAll(currentUser: CurrentUserPayload, query: QueryNotificationsDto) {
    const isRead =
      query.isRead === "true" ? true : query.isRead === "false" ? false : undefined;

    const notifications = await this.prisma.notification.findMany({
      where: {
        userId: currentUser.sub,
        ...(typeof isRead === "boolean" ? { isRead } : {}),
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return notifications.map((notification) => this.toNotificationDto(notification));
  }

  async findOne(id: string, currentUser: CurrentUserPayload) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId: currentUser.sub,
      },
    });

    if (!notification) {
      throw new NotFoundException("通知不存在");
    }

    return this.toNotificationDto(notification);
  }

  async markAsRead(id: string, currentUser: CurrentUserPayload) {
    const existing = await this.prisma.notification.findFirst({
      where: {
        id,
        userId: currentUser.sub,
      },
    });

    if (!existing) {
      throw new NotFoundException("通知不存在");
    }

    const notification = existing.isRead
      ? existing
      : await this.prisma.notification.update({
          where: { id: existing.id },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

    return this.toNotificationDto(notification);
  }

  private toNotificationDto(notification: {
    id: string;
    type: string;
    title: string;
    content: string;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
    skillSeriesId: string | null;
    skillId: string | null;
    versionLabel: string | null;
  }) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      isRead: notification.isRead,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      skillSeriesId: notification.skillSeriesId,
      skillId: notification.skillId,
      versionLabel: notification.versionLabel,
    };
  }

  private toChangelogSummary(changelog: string) {
    const normalized = changelog.replace(/\s+/g, " ").trim();
    if (normalized.length <= 160) {
      return normalized;
    }

    return `${normalized.slice(0, 157)}...`;
  }
}
