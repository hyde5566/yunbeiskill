import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { PERMISSIONS, SYSTEM_CATEGORIES, getPermissionMeta } from "@yunbei/shared";
import bcrypt from "bcryptjs";

@Injectable()
export class BootstrapService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const rootDepartment = await this.prisma.department.upsert({
      where: { code: "root" },
      update: {},
      create: {
        code: "root",
        name: "默认根部门",
        sortOrder: 0,
        status: "ACTIVE",
      },
    });

    for (const permissionCode of PERMISSIONS) {
      const meta = getPermissionMeta(permissionCode);
      await this.prisma.permission.upsert({
        where: { code: permissionCode },
        update: {
          module: meta.module,
          name: meta.name,
        },
        create: {
          code: permissionCode,
          module: meta.module,
          name: meta.name,
        },
      });
    }

    for (const [index, name] of SYSTEM_CATEGORIES.entries()) {
      await this.prisma.skillCategory.upsert({
        where: { code: `system-${index + 1}` },
        update: { name, sortOrder: index + 1, status: "ACTIVE" },
        create: {
          code: `system-${index + 1}`,
          name,
          sortOrder: index + 1,
          status: "ACTIVE",
        },
      });
    }

    const adminRole = await this.prisma.role.upsert({
      where: { code: "super-admin" },
      update: {},
      create: {
        code: "super-admin",
        name: "超级管理员",
        status: "ACTIVE",
      },
    });

    const adminUser = await this.prisma.user.upsert({
      where: { account: "admin" },
      update: {},
      create: {
        account: "admin",
        name: "系统管理员",
        passwordHash: await bcrypt.hash("Admin@123456", 10),
        departmentId: rootDepartment.id,
        status: "ACTIVE",
      },
    });

    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    const permissions = await this.prisma.permission.findMany();
    for (const permission of permissions) {
      await this.prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }
}
