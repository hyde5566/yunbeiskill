import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'is_public'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

export const REQUIRE_PERMISSION_KEY = 'require_permission'
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(REQUIRE_PERMISSION_KEY, permissions)