import type { PermissionCode } from "./permissions";

export interface AuthUser {
  id: string;
  account: string;
  name: string;
  department: string;
  permissions: PermissionCode[];
}

export interface LoginPayload {
  account: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  user: AuthUser;
}
