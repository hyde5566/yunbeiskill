import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { APP_GUARD } from '@nestjs/core'

import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { DepartmentModule } from './modules/department/department.module'
import { PermissionModule } from './modules/permission/permission.module'
import { ProjectModule } from './modules/project/project.module'
import { SkillCategoryModule } from './modules/skill-category/skill-category.module'
import { SkillModule } from './modules/skill/skill.module'
import { DownloadModule } from './modules/download/download.module'
import { RatingModule } from './modules/rating/rating.module'
import { FeedbackModule } from './modules/feedback/feedback.module'
import { NotificationModule } from './modules/notification/notification.module'
import { OperationLogModule } from './modules/operation-log/operation-log.module'
import { StatsModule } from './modules/stats/stats.module'
import { LoginLogModule } from './modules/login-log/login-log.module'

import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { PermissionGuard } from './common/guards/permission.guard'

import databaseConfig from './config/database.config'
import jwtConfig from './config/jwt.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: true
      })
    }),
    AuthModule,
    UserModule,
    DepartmentModule,
    PermissionModule,
    ProjectModule,
    SkillCategoryModule,
    SkillModule,
    DownloadModule,
    RatingModule,
    FeedbackModule,
    NotificationModule,
    OperationLogModule,
    StatsModule,
    LoginLogModule
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard }
  ]
})
export class AppModule {}