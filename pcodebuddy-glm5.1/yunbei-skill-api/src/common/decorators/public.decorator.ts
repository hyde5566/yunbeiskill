import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'
export const PERMISSIONS_KEY = 'permissions'

/**
 * 标记接口为公开接口，不需要JWT认证
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

/**
 * 标记接口所需权限
 * @param permissions 权限代码数组，如 ['basic', 'review', 'admin']
 */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions)
