import type { PermissionCode } from "./permissions";

export interface NavigationItem {
  key: string;
  label: string;
  path: string;
  permission?: PermissionCode | PermissionCode[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { key: "dashboard", label: "首页", path: "/dashboard", permission: "dashboard.view" },
  { key: "profile", label: "个人信息", path: "/profile", permission: "profile.view" },
  { key: "notifications", label: "通知中心", path: "/notifications", permission: "notification.view" },
  { key: "users", label: "用户管理", path: "/users", permission: "user.view" },
  { key: "roles", label: "角色管理", path: "/roles", permission: "role.view" },
  { key: "departments", label: "部门管理", path: "/departments", permission: "department.view" },
  { key: "projects", label: "项目管理", path: "/projects", permission: "project.view" },
  {
    key: "skills",
    label: "Skill管理",
    path: "/skills",
    permission: [
      "skill.submit",
      "skill.submission.view",
      "skill.review",
      "skill.publish",
      "skill.library.view",
      "skill.download",
      "skill.download-history.view",
    ],
  },
  {
    key: "skill-categories",
    label: "Skill分类",
    path: "/skill-categories",
    permission: "skill-category.view",
  },
  { key: "login-logs", label: "登录日志", path: "/logs/login", permission: "login-log.view" },
  {
    key: "operation-logs",
    label: "操作日志",
    path: "/logs/operation",
    permission: "operation-log.view",
  },
];
