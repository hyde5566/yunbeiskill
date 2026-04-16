import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const projects = await this.prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      members: project.members.map((member) => ({
        userId: member.userId,
        name: member.user.name,
        account: member.user.account,
      })),
    }));
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException("项目不存在");
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      members: project.members.map((member) => ({
        userId: member.userId,
        name: member.user.name,
        account: member.user.account,
      })),
    };
  }

  async create(dto: CreateProjectDto) {
    const existing = await this.prisma.project.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException("项目名称已存在");
    }

    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: "ACTIVE",
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    const existing = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("项目不存在");
    }

    const nextName = dto.name ?? existing.name;
    if (nextName !== existing.name) {
      const duplicate = await this.prisma.project.findUnique({
        where: { name: nextName },
      });

      if (duplicate) {
        throw new ConflictException("项目名称已存在");
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        name: nextName,
        description: dto.description ?? existing.description,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.project.delete({
      where: { id },
    });

    return { success: true };
  }

  async addMembers(projectId: string, userIds: string[]) {
    await this.findOne(projectId);

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    if (users.length !== userIds.length) {
      throw new NotFoundException("用户不存在");
    }

    await this.prisma.projectMember.createMany({
      data: userIds.map((userId) => ({ projectId, userId })),
      skipDuplicates: true,
    });

    return this.findOne(projectId);
  }

  async removeMember(projectId: string, userId: string) {
    await this.prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return this.findOne(projectId);
  }
}
