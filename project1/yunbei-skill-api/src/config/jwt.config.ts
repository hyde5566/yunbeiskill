import { registerAs } from '@nestjs/config'

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || '', // 生产环境必须设置JWT_SECRET环境变量
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
}))