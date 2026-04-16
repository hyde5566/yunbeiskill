import { describe, expect, it } from "vitest";
import type { AuthUser } from "@yunbei/shared";
import {
  buildDashboardNotificationDigest,
  buildDashboardOverview,
} from "./dashboard-page.helpers";

const currentUser: AuthUser = {
  id: "u1",
  account: "admin",
  name: "系统管理员",
  department: "默认根部门",
  permissions: ["dashboard.view", "profile.view", "user.view", "project.view"],
};

describe("dashboard page helpers", () => {
  it("builds overview stats and quick actions from the current user context", () => {
    const overview = buildDashboardOverview(currentUser, [
      { key: "dashboard", label: "首页", path: "/dashboard" },
      { key: "profile", label: "个人信息", path: "/profile" },
      { key: "users", label: "用户管理", path: "/users" },
      { key: "projects", label: "项目管理", path: "/projects" },
    ], 2);

    expect(overview.stats).toEqual([
      { label: "当前账号", value: "admin" },
      { label: "所属部门", value: "默认根部门" },
      { label: "权限点数", value: "4" },
      { label: "可用菜单", value: "4" },
      { label: "未读通知", value: "2" },
    ]);

    expect(overview.quickActions).toEqual([
      { label: "个人信息", path: "/profile" },
      { label: "用户管理", path: "/users" },
      { label: "项目管理", path: "/projects" },
    ]);
  });

  it("builds a notification digest for dashboard summary", () => {
    const digest = buildDashboardNotificationDigest([
      {
        id: "n1",
        title: "Skill 新版本已发布：智能助手 1.1.0",
        content: "智能助手已发布新版本，请前往详情页下载并查看更新说明。",
        createdAt: "2026-04-15T08:30:00.000Z",
      },
      {
        id: "n2",
        title: "Skill 新版本已发布：流程助手 2.0.0",
        content: "流程助手已发布新版本。",
        createdAt: "2026-04-15T09:30:00.000Z",
      },
    ]);

    expect(digest.total).toBe(2);
    expect(digest.items[0]).toMatchObject({
      id: "n1",
      title: "Skill 新版本已发布：智能助手 1.1.0",
      path: "/notifications",
    });
    expect(digest.items[0].preview).toContain("智能助手已发布新版本");
    expect(digest.items[0].createdAtLabel).toMatch(/^2026-04-15 \d{2}:\d{2}$/);
  });
});
