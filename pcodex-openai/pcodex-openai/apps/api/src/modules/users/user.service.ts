import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { PrismaService } from "../../database/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        department: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      account: user.account,
      name: user.name,
      status: user.status,
      department: {
        id: user.department.id,
        name: user.department.name,
      },
      roles: user.userRoles.map((item) => ({
        id: item.role.id,
        code: item.role.code,
        name: item.role.name,
      })),
    }));
  }

  private async getValidatedRelations(departmentId: string, roleIds: string[]) {
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException("部门不存在");
    }

    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds } },
    });

    if (roles.length !== roleIds.length) {
      throw new NotFoundException("角色不存在");
    }
  }

  private mapUser(user: {
    id: string;
    account: string;
    name: string;
    status: string;
    department: { id: string; name: string };
    userRoles: Array<{ role: { id: string; code: string; name: string } }>;
  }) {
    return {
      id: user.id,
      account: user.account,
      name: user.name,
      status: user.status,
      department: {
        id: user.department.id,
        name: user.department.name,
      },
      roles: user.userRoles.map((item) => ({
        id: item.role.id,
        code: item.role.code,
        name: item.role.name,
      })),
    };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { account: dto.account },
    });

    if (existing) {
      throw new ConflictException("账号已存在");
    }

    await this.getValidatedRelations(dto.departmentId, dto.roleIds);

    const user = await this.prisma.user.create({
      data: {
        account: dto.account,
        name: dto.name,
        passwordHash: await bcrypt.hash(dto.password, 10),
        departmentId: dto.departmentId,
        status: "ACTIVE",
        userRoles: {
          create: dto.roleIds.map((roleId) => ({ roleId })),
        },
      },
      include: {
        department: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return this.mapUser(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("用户不存在");
    }

    const currentRoleIds = (
      await this.prisma.userRole.findMany({
        where: { userId: id },
        select: { roleId: true },
      })
    ).map((item) => item.roleId);

    const nextDepartmentId = dto.departmentId ?? existing.departmentId;
    await this.getValidatedRelations(nextDepartmentId, currentRoleIds);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        departmentId: nextDepartmentId,
      },
      include: {
        department: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return this.mapUser(user);
  }

  async assignRoles(id: string, roleIds: string[]) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("用户不存在");
    }

    await this.getValidatedRelations(existing.departmentId, roleIds);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        userRoles: {
          deleteMany: {},
          create: roleIds.map((roleId) => ({ roleId })),
        },
      },
      include: {
        department: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return this.mapUser(user);
  }

  async updateStatus(id: string, status: "ACTIVE" | "DISABLED") {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status },
      include: {
        department: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return this.mapUser(user);
  }

  async remove(id: string, currentUserId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, account: true },
    });

    if (!existing) {
      throw new NotFoundException("用户不存在");
    }

    if (existing.id === currentUserId) {
      throw new BadRequestException("不能删除当前登录账号");
    }

    if (existing.account === "admin") {
      throw new BadRequestException("系统管理员账号不可删除");
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { success: true };
  }
}
