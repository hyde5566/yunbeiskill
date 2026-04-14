import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService
  ) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (isPublic) {
      return true
    }

    // 支持从URL query参数读取token（用于导出下载）
    const request = context.switchToHttp().getRequest()
    const queryToken = request.query?.token as string
    if (queryToken) {
      try {
        const payload = this.jwtService.verify(queryToken)
        // 标准化payload字段，与jwt.strategy.ts保持一致
        request.user = {
          userId: payload.sub,
          username: payload.username,
          permissions: payload.permissions,
          departmentId: payload.departmentId
        }
        return true
      } catch (e) {
        throw new UnauthorizedException('Token无效或已过期')
      }
    }

    // 对于非公开接口，调用父类进行JWT验证
    return super.canActivate(context)
  }

  handleRequest(err: Error | null, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('未登录或Token已过期')
    }
    return user
  }
}