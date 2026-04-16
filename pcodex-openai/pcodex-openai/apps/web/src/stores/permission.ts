import { NAVIGATION_ITEMS, type PermissionCode } from "@yunbei/shared";

export function buildVisibleNavigation(permissions: PermissionCode[]) {
  return NAVIGATION_ITEMS.filter(
    (item) =>
      !item.permission ||
      (Array.isArray(item.permission)
        ? item.permission.some((permission) => permissions.includes(permission))
        : permissions.includes(item.permission)),
  );
}
