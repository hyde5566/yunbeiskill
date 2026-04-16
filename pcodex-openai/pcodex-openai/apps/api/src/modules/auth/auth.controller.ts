import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto, @Req() req: { ip?: string }) {
    return {
      success: true,
      message: "登录成功",
      data: await this.authService.login(dto, req.ip),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(
    @CurrentUser()
    user: { sub: string; account: string; name: string; department: string; permissions: string[] },
  ) {
    return {
      success: true,
      message: "获取成功",
      data: await this.authService.me(user),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch("password")
  async changePassword(
    @CurrentUser() user: { sub: string },
    @Body() dto: ChangePasswordDto,
  ) {
    return {
      success: true,
      message: "修改成功",
      data: await this.authService.changePassword(user.sub, dto),
    };
  }
}
