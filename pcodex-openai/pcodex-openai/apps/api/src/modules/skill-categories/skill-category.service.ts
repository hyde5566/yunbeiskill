import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { UpdateSkillCategoryDto } from "./dto/update-skill-category.dto";

@Injectable()
export class SkillCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.skillCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  update(id: string, dto: UpdateSkillCategoryDto) {
    return this.prisma.skillCategory.update({
      where: { id },
      data: {
        name: dto.name,
        sortOrder: dto.sortOrder,
        status: dto.status,
      },
    });
  }
}
