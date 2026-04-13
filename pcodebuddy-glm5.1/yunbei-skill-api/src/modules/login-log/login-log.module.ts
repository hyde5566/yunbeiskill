import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoginLogController } from './login-log.controller'
import { LoginLogService } from './login-log.service'
import { LoginLog } from './entities/login-log.entity'

@Module({
  imports: [TypeOrmModule.forFeature([LoginLog])],
  controllers: [LoginLogController],
  providers: [LoginLogService],
  exports: [LoginLogService],
})
export class LoginLogModule {}
