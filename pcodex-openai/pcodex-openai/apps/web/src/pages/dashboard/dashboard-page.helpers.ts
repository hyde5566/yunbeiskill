import type { AuthUser, NavigationItem } from "@yunbei/shared";
import {
  buildNotificationPreview,
  formatNotificationTime,
} from "../notifications/notification-page.helpers";

interface DashboardNotificationItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export function buildDashboardOverview(
  currentUser: AuthUser,
  navigation: NavigationItem[],
  unreadNotificationCount = 0,
) {
  return {
    stats: [
      { label: "当前账号", value: currentUser.account },
      { label: "所属部门", value: currentUser.department },
      { label: "权限点数", value: String(currentUser.permissions.length) },
      { label: "可用菜单", value: String(navigation.length) },
      { label: "未读通知", value: String(unreadNotificationCount) },
    ],
    quickActions: navigation
      .filter((item) => item.path !== "/dashboard")
      .slice(0, 3)
      .map((item) => ({
        label: item.label,
        path: item.path,
      })),
  };
}

export function buildDashboardNotificationDigest(
  notifications: DashboardNotificationItem[],
  maxItems = 3,
) {
  return {
    total: notifications.length,
    items: notifications.slice(0, maxItems).map((item) => ({
      id: item.id,
      title: item.title,
      preview: buildNotificationPreview(item.content, 56),
      createdAtLabel: formatNotificationTime(item.createdAt),
      path: "/notifications",
    })),
  };
}
