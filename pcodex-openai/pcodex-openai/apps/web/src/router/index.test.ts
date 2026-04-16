import { describe, expect, it } from "vitest";
import { canAccessRoute, listAccessiblePaths, resolveRouteAccess } from "./index";

describe("router permissions", () => {
  it("blocks route access when the permission is missing", () => {
    expect(canAccessRoute("/users", ["dashboard.view"])).toBe(false);
    expect(canAccessRoute("/users", ["user.view"])).toBe(true);
  });

  it("includes all expected routes when permissions are present", () => {
    const permissions = [
      "dashboard.view",
      "profile.view",
      "notification.view",
      "user.view",
      "role.view",
      "department.view",
      "project.view",
      "skill.download",
      "skill-category.view",
      "login-log.view",
      "operation-log.view",
    ];

    expect(listAccessiblePaths(permissions)).toEqual([
      "/dashboard",
      "/profile",
      "/notifications",
      "/users",
      "/roles",
      "/departments",
      "/projects",
      "/skills",
      "/skill-categories",
      "/logs/login",
      "/logs/operation",
    ]);
  });

  it("redirects unauthenticated users to login for protected routes", () => {
    expect(resolveRouteAccess("/users", [], false)).toBe("/login");
    expect(resolveRouteAccess("/login", [], false)).toBeNull();
  });
});
