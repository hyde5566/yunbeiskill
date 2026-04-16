import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { code: "asc" }],
    });

    return permissions.map((permission) => ({
      id: permission.id,
      module: permission.module,
      code: permission.code,
      name: permission.name,
      description: permission.description,
    }));
  }
}
