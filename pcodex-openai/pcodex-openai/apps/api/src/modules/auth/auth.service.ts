import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { PrismaService } from "../../database/prisma.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto, ip?: string) {
    const user = await this.prisma.user.findUnique({
      where: { account: dto.account },
      include: {
        department: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== "ACTIVE") {
      await this.recordLogin(dto.account, null, "FAILURE", ip, "账号不存在或已停用");
      throw new UnauthorizedException("账号不存在或已停用");
    }

    const matched = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matched) {
      await this.recordLogin(dto.account, user.id, "FAILURE", ip, "密码错误");
      throw new UnauthorizedException("账号或密码错误");
    }

    const permissions = [
      ...new Set(
        user.userRoles.flatMap((link) =>
          link.role.rolePermissions.map((rolePermission) => rolePermission.permission.code),
        ),
      ),
    ];

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.recordLogin(user.account, user.id, "SUCCESS", ip);

    return {
      accessToken: await this.jwtService.signAsync({
        sub: user.id,
        account: user.account,
        permissions,
      }),
      user: {
        id: user.id,
        account: user.account,
        name: user.name,
        department: user.department.name,
        permissions,
      },
    };
  }

  async me(user: {
    sub: string;
    account: string;
    name: string;
    department: string;
    permissions: string[];
  }) {
    return {
      id: user.sub,
      account: user.account,
      name: user.name,
      department: user.department,
      permissions: user.permissions,
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("账号不存在");
    }

    const matched = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!matched) {
      throw new UnauthorizedException("当前密码错误");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await bcrypt.hash(dto.newPassword, 10),
      },
    });

    return { success: true };
  }

  private async recordLogin(
    account: string,
    userId: string | null,
    result: "SUCCESS" | "FAILURE",
    ip?: string,
    failureReason?: string,
  ) {
    await this.prisma.loginLog.create({
      data: {
        account,
        userId,
        result,
        loginIp: ip ?? null,
        failureReason: failureReason ?? null,
      },
    });
  }
}
