import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PermissionController } from './permission.controller'
import { PermissionService } from './permission.service'
import { Permission } from './entities/permission.entity'
import { UserPermission } from './entities/user-permission.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Permission, UserPermission])],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}
