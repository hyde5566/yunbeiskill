import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSIONS_KEY } from '../decorators/public.decorator'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    // 没有标记权限要求，直接放行
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user || !user.permissions) {
      throw new ForbiddenException('无权限访问')
    }

    // admin权限自动拥有所有权限
    if (user.permissions.includes('admin')) {
      return true
    }

    // 检查是否拥有任一所需权限
    const hasPermission = requiredPermissions.some((perm) =>
      user.permissions.includes(perm),
    )

    if (!hasPermission) {
      throw new ForbiddenException('无权限访问')
    }

    return true
  }
}
