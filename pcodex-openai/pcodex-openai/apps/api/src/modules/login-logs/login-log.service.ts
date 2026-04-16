import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class LoginLogService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.loginLog.findMany({
      orderBy: { loginAt: "desc" },
    });
  }
}
