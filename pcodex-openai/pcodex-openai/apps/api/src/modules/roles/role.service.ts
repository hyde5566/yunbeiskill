import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveRoleCode(inputCode?: string) {
    if (inputCode?.trim()) {
      return inputCode.trim();
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const generated = `role-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const existing = await this.prisma.role.findUnique({
        where: { code: generated },
        select: { id: true },
      });

      if (!existing) {
        return generated;
      }
    }

    throw new ConflictException("角色编码生成失败，请重试");
  }

  private mapRole(role: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    status: string;
    rolePermissions: Array<{ permission: { code: string } }>;
  }) {
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      status: role.status,
      permissionCodes: role.rolePermissions.map((item) => item.permission.code),
    };
  }

  private async ensurePermissionCodesExist(permissionCodes: string[]) {
    const permissions = await this.prisma.permission.findMany({
      where: { code: { in: permissionCodes } },
    });

    if (permissions.length !== permissionCodes.length) {
      throw new NotFoundException("权限点不存在");
    }
  }

  async findAll() {
    const roles = await this.prisma.role.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return roles.map((role) => this.mapRole(role));
  }

  async create(dto: CreateRoleDto) {
    const roleCode = await this.resolveRoleCode(dto.code);

    const existing = await this.prisma.role.findUnique({
      where: { code: roleCode },
    });

    if (existing) {
      throw new ConflictException("角色编码已存在");
    }

    await this.ensurePermissionCodesExist(dto.permissionCodes);

    const role = await this.prisma.role.create({
      data: {
        code: roleCode,
        name: dto.name,
        description: dto.description,
        status: "ACTIVE",
        rolePermissions: {
          create: dto.permissionCodes.map((code) => ({
            permission: {
              connect: { code },
            },
          })),
        },
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return this.mapRole(role);
  }

  async update(id: string, dto: UpdateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("角色不存在");
    }

    if (dto.permissionCodes) {
      await this.ensurePermissionCodesExist(dto.permissionCodes);
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        description: dto.description ?? existing.description,
        rolePermissions: dto.permissionCodes
          ? {
              deleteMany: {},
              create: dto.permissionCodes.map((code) => ({
                permission: {
                  connect: { code },
                },
              })),
            }
          : undefined,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return this.mapRole(role);
  }

  async remove(id: string) {
    const assignmentCount = await this.prisma.userRole.count({
      where: { roleId: id },
    });

    if (assignmentCount > 0) {
      throw new BadRequestException("角色已分配给用户，不可删除");
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return { success: true };
  }
}
