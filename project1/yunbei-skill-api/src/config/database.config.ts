import { registerAs } from '@nestjs/config'

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '', // 生产环境必须设置DB_PASSWORD环境变量
  database: process.env.DB_DATABASE || 'yunbei_skill'
}))