import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { User } from './entities/user.entity'
import { UserPermission } from '../permission/entities/user-permission.entity'
import { Permission } from '../permission/entities/permission.entity'
import { Skill } from '../skill/entities/skill.entity'
import { DownloadRecord } from '../download/entities/download-record.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPermission, Permission, Skill, DownloadRecord])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}