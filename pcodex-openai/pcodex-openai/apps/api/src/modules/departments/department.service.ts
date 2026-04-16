import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveDepartmentCode(inputCode?: string) {
    if (inputCode?.trim()) {
      return inputCode.trim();
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const generated = `dept-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const existing = await this.prisma.department.findUnique({
        where: { code: generated },
        select: { id: true },
      });
      if (!existing) {
        return generated;
      }
    }

    throw new ConflictException("部门编码生成失败，请重试");
  }

  async findAll() {
    return this.prisma.department.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  async create(dto: CreateDepartmentDto) {
    const departmentCode = await this.resolveDepartmentCode(dto.code);

    const existing = await this.prisma.department.findUnique({
      where: { code: departmentCode },
    });

    if (existing) {
      throw new ConflictException("部门编码已存在");
    }

    if (dto.parentId) {
      const parent = await this.prisma.department.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException("上级部门不存在");
      }
    }

    return this.prisma.department.create({
      data: {
        code: departmentCode,
        name: dto.name,
        parentId: dto.parentId ?? null,
        sortOrder: dto.sortOrder ?? 0,
        status: "ACTIVE",
      },
    });
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("部门不存在");
    }

    if (dto.parentId === id) {
      throw new BadRequestException("上级部门不能是自己");
    }

    if (dto.parentId) {
      const parent = await this.prisma.department.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException("上级部门不存在");
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        parentId: dto.parentId === undefined ? existing.parentId : dto.parentId,
        sortOrder: dto.sortOrder ?? existing.sortOrder,
      },
    });
  }

  async remove(id: string) {
    const memberCount = await this.prisma.user.count({
      where: { departmentId: id },
    });
    if (memberCount > 0) {
      throw new BadRequestException("部门下仍有成员，不可删除");
    }

    const childCount = await this.prisma.department.count({
      where: { parentId: id },
    });
    if (childCount > 0) {
      throw new BadRequestException("部门下仍有子部门，不可删除");
    }

    await this.prisma.department.delete({
      where: { id },
    });

    return { success: true };
  }
}
