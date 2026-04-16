import { createMemoryHistory, createRouter, createWebHistory } from "vue-router";
import DashboardPage from "../pages/dashboard/DashboardPage.vue";
import LoginPage from "../pages/auth/LoginPage.vue";
import DepartmentPage from "../pages/departments/DepartmentPage.vue";
import LoginLogPage from "../pages/logs/LoginLogPage.vue";
import OperationLogPage from "../pages/logs/OperationLogPage.vue";
import NotificationPage from "../pages/notifications/NotificationPage.vue";
import ProjectListPage from "../pages/projects/ProjectListPage.vue";
import ProfilePage from "../pages/profile/ProfilePage.vue";
import RoleListPage from "../pages/roles/RoleListPage.vue";
import SkillPage from "../pages/skills/SkillPage.vue";
import SkillCategoryPage from "../pages/skill-categories/SkillCategoryPage.vue";
import UserListPage from "../pages/users/UserListPage.vue";
import AppLayout from "../layouts/AppLayout.vue";
import { hydrateAuthState } from "../stores/auth";

const routePermissionMap: Record<string, string | string[] | undefined> = {
  "/dashboard": "dashboard.view",
  "/profile": "profile.view",
  "/notifications": "notification.view",
  "/users": "user.view",
  "/roles": "role.view",
  "/departments": "department.view",
  "/projects": "project.view",
  "/skills": [
    "skill.submit",
    "skill.submission.view",
    "skill.review",
    "skill.publish",
    "skill.library.view",
    "skill.download",
    "skill.download-history.view",
  ],
  "/skill-categories": "skill-category.view",
  "/logs/login": "login-log.view",
  "/logs/operation": "operation-log.view",
};

export const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/login", component: LoginPage },
  {
    path: "/",
    component: AppLayout,
    children: [
      { path: "/dashboard", component: DashboardPage, meta: { permission: "dashboard.view" } },
      { path: "/profile", component: ProfilePage, meta: { permission: "profile.view" } },
      {
        path: "/notifications",
        component: NotificationPage,
        meta: { permission: "notification.view" },
      },
      { path: "/users", component: UserListPage, meta: { permission: "user.view" } },
      { path: "/roles", component: RoleListPage, meta: { permission: "role.view" } },
      {
        path: "/departments",
        component: DepartmentPage,
        meta: { permission: "department.view" },
      },
      {
        path: "/projects",
        component: ProjectListPage,
        meta: { permission: "project.view" },
      },
      {
        path: "/skills",
        component: SkillPage,
        meta: {
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
      },
      {
        path: "/skill-categories",
        component: SkillCategoryPage,
        meta: { permission: "skill-category.view" },
      },
      {
        path: "/logs/login",
        component: LoginLogPage,
        meta: { permission: "login-log.view" },
      },
      {
        path: "/logs/operation",
        component: OperationLogPage,
        meta: { permission: "operation-log.view" },
      },
    ],
  },
];

export function canAccessRoute(path: string, permissions: string[]) {
  const required = routePermissionMap[path];
  if (!required) {
    return true;
  }

  return Array.isArray(required)
    ? required.some((permission) => permissions.includes(permission))
    : permissions.includes(required);
}

export function listAccessiblePaths(permissions: string[]) {
  return Object.keys(routePermissionMap).filter((path) => canAccessRoute(path, permissions));
}

export function resolveRouteAccess(
  path: string,
  permissions: string[],
  isAuthenticated: boolean,
) {
  if (path === "/login") {
    return isAuthenticated ? "/dashboard" : null;
  }

  if (!isAuthenticated) {
    return "/login";
  }

  return canAccessRoute(path, permissions) ? null : "/dashboard";
}

export const router = createRouter({
  history: typeof window === "undefined" ? createMemoryHistory() : createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authState = hydrateAuthState({
    accessToken: typeof window === "undefined" ? null : window.localStorage.getItem("accessToken"),
    currentUser: typeof window === "undefined" ? null : window.localStorage.getItem("currentUser"),
  });

  const redirectPath = resolveRouteAccess(
    to.path,
    authState.currentUser?.permissions ?? [],
    Boolean(authState.accessToken),
  );

  return redirectPath ? { path: redirectPath } : true;
});
