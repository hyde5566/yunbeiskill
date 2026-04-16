export type NotificationFilter = "ALL" | "UNREAD" | "READ";

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  skillSeriesId: string | null;
  skillId: string | null;
  versionLabel: string | null;
}

export function buildNotificationQuery(filter: NotificationFilter) {
  if (filter === "UNREAD") {
    return "?isRead=false";
  }

  if (filter === "READ") {
    return "?isRead=true";
  }

  return "";
}

export function buildNotificationPreview(content: string, maxLength = 72) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "暂无通知内容";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}...`;
}

export function buildNotificationSkillTarget(notification: Pick<NotificationRow, "skillId">) {
  if (!notification.skillId) {
    return null;
  }

  return {
    path: "/skills",
    query: {
      skillId: notification.skillId,
    },
  };
}

export function getNotificationTypeLabel(type: string) {
  if (type === "SKILL_VERSION_RELEASED") {
    return "Skill 新版本";
  }

  return "系统通知";
}

export function formatNotificationTime(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
