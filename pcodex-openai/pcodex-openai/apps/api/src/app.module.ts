import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { AuditLogInterceptor } from "./common/interceptors/audit-log.interceptor";
import { PrismaModule } from "./database/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BootstrapModule } from "./modules/bootstrap/bootstrap.module";
import { DepartmentModule } from "./modules/departments/department.module";
import { LoginLogModule } from "./modules/login-logs/login-log.module";
import { NotificationModule } from "./modules/notifications/notification.module";
import { OperationLogModule } from "./modules/operation-logs/operation-log.module";
import { PermissionModule } from "./modules/permissions/permission.module";
import { ProjectModule } from "./modules/projects/project.module";
import { RoleModule } from "./modules/roles/role.module";
import { SkillModule } from "./modules/skills/skill.module";
import { SkillCategoryModule } from "./modules/skill-categories/skill-category.module";
import { UserModule } from "./modules/users/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"],
    }),
    PrismaModule,
    BootstrapModule,
    AuthModule,
    DepartmentModule,
    LoginLogModule,
    NotificationModule,
    OperationLogModule,
    PermissionModule,
    ProjectModule,
    RoleModule,
    SkillModule,
    SkillCategoryModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
