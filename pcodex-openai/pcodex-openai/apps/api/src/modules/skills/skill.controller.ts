import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuditLog } from "../../common/decorators/audit-log.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionGuard } from "../../common/guards/permission.guard";
import { CreateSkillDto } from "./dto/create-skill.dto";
import { CreateSkillVersionDto } from "./dto/create-skill-version.dto";
import { DownloadSkillDto } from "./dto/download-skill.dto";
import { ReviewSkillDto } from "./dto/review-skill.dto";
import { SubmitSkillRatingDto } from "./dto/submit-skill-rating.dto";
import { SkillService } from "./skill.service";
import type { SkillStorageFileInput } from "./storage/skill-storage.service";

interface CurrentUserPayload {
  sub: string;
  account: string;
  name: string;
  department: string;
  permissions: string[];
}

@Controller("skills")
@UseGuards(JwtAuthGuard, PermissionGuard)
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post()
  @Permissions("skill.submit")
  @AuditLog({ module: "skills", operationType: "submit", targetType: "skill" })
  @UseInterceptors(FileInterceptor("packageFile"))
  async create(
    @Body() dto: CreateSkillDto,
    @UploadedFile() packageFile: SkillStorageFileInput | undefined,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return {
      success: true,
      message: "提交成功",
      data: await this.skillService.create(dto, packageFile, currentUser),
    };
  }

  @Get("submissions")
  @Permissions("skill.submission.view")
  async findSubmissions(@CurrentUser() currentUser: CurrentUserPayload) {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillService.findSubmissions(currentUser),
    };
  }

  @Get("options/projects")
  @Permissions("skill.submit")
  async findProjectOptions() {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillService.findProjectOptions(),
    };
  }

  @Get("options/categories")
  async findCategoryOptions() {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillService.findCategoryOptions(),
    };
  }

  @Get("options/users")
  @Permissions("skill.submit")
  async findUserOptions() {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillService.findUserOptions(),
    };
  }

  @Get("downloads/history")
  @Permissions("skill.download-history.view")
  async findDownloadHistory(@CurrentUser() currentUser: CurrentUserPayload) {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillService.findDownloadHistory(currentUser),
    };
  }

  @Get("downloads/records")
  @Permissions("skill.download-history.view")
  async findDownloadRecords(@CurrentUser() currentUser: CurrentUserPayload) {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillService.findDownloadRecords(currentUser),
    };
  }

  @Post(":id/rating")
  @Permissions("skill.rate")
  @AuditLog({ module: "skills", operationType: "rate", targetType: "skill" })
  async submitRating(
    @Param("id") id: string,
    @Body() dto: SubmitSkillRatingDto,
    @Req()
    request: {
      auditLogOverride?: {
        operationType?: string;
        targetId?: string | null;
        detailJson?: string;
      };
    },
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const result = await this.skillService.submitRating(id, dto, currentUser);
    request.auditLogOverride = result.auditLog;

    return {
      success: true,
      message: "评分成功",
      data: result.rating,
    };
  }

  @Get(":id/rating-summary")
  @Permissions("skill.rating.view")
  async findRatingSummary(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillService.findRatingSummary(id, currentUser),
    };
  }

  @Get(":id/rating/me")
  @Permissions("skill.rating.view")
  async findMyRating(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillService.findMyRating(id, currentUser),
    };
  }

  @Get(":id/ratings")
  @Permissions("skill.rating.view")
  async findRatings(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillService.findRatings(id, currentUser),
    };
  }

  @Get(":id/download")
  @Permissions("skill.download")
  @AuditLog({ module: "skills", operationType: "download", targetType: "skill" })
  async downloadFile(
    @Param("id") id: string,
    @Query("versionId") versionId: string | undefined,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    const result = await this.skillService.download(id, versionId, currentUser);

    return new StreamableFile(result.stream, {
      type: result.mimeType,
      disposition: `attachment; filename="${encodeURIComponent(result.fileName)}"`,
    });
  }

  @Get("submissions/:id")
  @Permissions("skill.submission.view")
  async findSubmission(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillService.findSubmission(id, currentUser),
    };
  }

  @Get(":id/versions")
  @Permissions("skill.library.view")
  async findVersions(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillService.findVersions(id, currentUser),
    };
  }

  @Get("library/:id")
  @Permissions("skill.library.view")
  async findLibraryDetail(
    @Param("id") id: string,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillService.findLibraryDetail(id, currentUser),
    };
  }

  @Post(":id/downloads")
  @Permissions("skill.download")
  @AuditLog({ module: "skills", operationType: "download", targetType: "skill" })
  async download(
    @Param("id") id: string,
    @Body() dto: DownloadSkillDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return {
      success: true,
      message: "下载记录成功",
      data: await this.skillService.recordDownload(id, dto, currentUser),
    };
  }

  @Post(":id/versions")
  @Permissions("skill.submit")
  @AuditLog({ module: "skills", operationType: "submit-version", targetType: "skill" })
  @UseInterceptors(FileInterceptor("packageFile"))
  async createVersion(
    @Param("id") id: string,
    @Body() dto: CreateSkillVersionDto,
    @UploadedFile() packageFile: SkillStorageFileInput | undefined,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return {
      success: true,
      message: "版本已提交",
      data: await this.skillService.createVersion(id, dto, packageFile, currentUser),
    };
  }

  @Post(":id/review")
  @Permissions("skill.review")
  @AuditLog({ module: "skills", operationType: "review", targetType: "skill" })
  async review(
    @Param("id") id: string,
    @Body() dto: ReviewSkillDto,
    @CurrentUser() currentUser: CurrentUserPayload,
  ) {
    return {
      success: true,
      message: "审核完成",
      data: await this.skillService.review(id, dto, currentUser),
    };
  }

  @Post(":id/publish")
  @Permissions("skill.publish")
  @AuditLog({ module: "skills", operationType: "publish", targetType: "skill" })
  async publish(@Param("id") id: string, @CurrentUser() currentUser: CurrentUserPayload) {
    return {
      success: true,
      message: "发布成功",
      data: await this.skillService.publish(id, currentUser),
    };
  }

  @Get("library")
  @Permissions("skill.library.view")
  async findLibrary(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Query("keyword") keyword?: string,
    @Query("categoryId") categoryId?: string,
    @Query("sourceType") sourceType?: string,
  ) {
    return {
      success: true,
      message: "获取成功",
      data: await this.skillService.findLibrary(currentUser, {
        keyword,
        categoryId,
        sourceType,
      }),
    };
  }
}
