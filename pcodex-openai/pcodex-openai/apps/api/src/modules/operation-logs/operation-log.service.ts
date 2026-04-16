import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class OperationLogService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.operationLog.findMany({
      orderBy: { operatedAt: "desc" },
    });
  }
}
