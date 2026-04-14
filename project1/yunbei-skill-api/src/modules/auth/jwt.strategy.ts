import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    const secret = config.get<string>('jwt.secret')
    if (!secret) {
      throw new Error('JWT_SECRET环境变量未设置，请配置后启动应用')
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret
    })
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      permissions: payload.permissions,
      departmentId: payload.departmentId
    }
  }
}