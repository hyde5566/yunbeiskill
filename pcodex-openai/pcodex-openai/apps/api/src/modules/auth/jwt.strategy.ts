import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../database/prisma.service";

interface JwtPayload {
  sub: string;
  account: string;
  permissions: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? "yunbei-skill-openai54-dev-secret",
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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
      throw new UnauthorizedException("账号不存在或已停用");
    }

    const permissions = [
      ...new Set(
        user.userRoles.flatMap((link) =>
          link.role.rolePermissions.map((rolePermission) => rolePermission.permission.code),
        ),
      ),
    ];

    return {
      sub: user.id,
      account: user.account,
      name: user.name,
      department: user.department.name,
      permissions,
    };
  }
}
