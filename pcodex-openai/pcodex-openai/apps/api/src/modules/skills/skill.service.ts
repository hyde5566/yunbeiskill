import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Prisma,
  Skill,
  SkillSourceType,
  SkillStatus,
  SkillVisibility,
} from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { NotificationService } from "../notifications/notification.service";
import { CreateSkillDto } from "./dto/create-skill.dto";
import { CreateSkillVersionDto } from "./dto/create-skill-version.dto";
import { DownloadSkillDto } from "./dto/download-skill.dto";
import { ReviewSkillDto, SkillReviewAction } from "./dto/review-skill.dto";
import { SubmitSkillRatingDto } from "./dto/submit-skill-rating.dto";
import { SkillStorageService, type SkillStorageFileInput } from "./storage/skill-storage.service";

interface CurrentUserPayload {
  sub: string;
  account: string;
  name: string;
  department: string;
  permissions: string[];
}

interface SkillLibraryQuery {
  keyword?: string;
  categoryId?: string;
  sourceType?: string;
}

const SKILL_DETAIL_INCLUDE = {
  category: true,
  submitter: true,
  reviewedBy: true,
  publishedBy: true,
  projects: {
    include: {
      project: true,
    },
  },
  visibleUsers: {
    include: {
      user: true,
    },
  },
} satisfies Prisma.SkillInclude;

type SkillWithRelations = Prisma.SkillGetPayload<{
  include: typeof SKILL_DETAIL_INCLUDE;
}>;

const SKILL_RATING_INCLUDE = {
  rater: {
    include: {
      department: true,
    },
  },
  department: true,
} satisfies Prisma.SkillRatingInclude;

type SkillRatingWithRelations = Prisma.SkillRatingGetPayload<{
  include: typeof SKILL_RATING_INCLUDE;
}>;

@Injectable()
export class SkillService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly skillStorageService: SkillStorageService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    dto: CreateSkillDto,
    packageFile: SkillStorageFileInput | undefined,
    currentUser: CurrentUserPayload,
  ) {
    const normalizedDto = this.normalizeCreateDto(dto);
    await this.ensureCreatePayloadIsValid(normalizedDto);
    const skillId = randomUUID();
    const storedPackage = await this.storePackageOrThrow(skillId, packageFile);

    let skill: SkillWithRelations | null = null;
    try {
      skill = await this.prisma.$transaction(async (tx) => {
        const created = await tx.skill.create({
          data: {
            id: skillId,
            seriesId: skillId,
            versionLabel: "1.0.0",
            name: normalizedDto.name,
            summary: normalizedDto.summary,
            description: normalizedDto.description,
            authorName: normalizedDto.authorName,
            categoryId: normalizedDto.categoryId,
            sourceType: normalizedDto.sourceType,
            sourceUrl:
              normalizedDto.sourceType === SkillSourceType.EXTERNAL
                ? normalizedDto.sourceUrl
                : null,
            sourceLabel:
              normalizedDto.sourceType === SkillSourceType.EXTERNAL
                ? normalizedDto.sourceLabel
                : null,
            visibility: normalizedDto.visibility,
            packageName: storedPackage.originalName,
            packageSizeBytes: storedPackage.sizeBytes,
            packageOriginalName: storedPackage.originalName,
            packageStoredName: storedPackage.storedName,
            packageRelativePath: storedPackage.relativePath,
            packageMimeType: storedPackage.mimeType,
            packageChecksum: storedPackage.checksum,
            packageUploadedAt: storedPackage.uploadedAt,
            changelog: normalizedDto.changelog,
            submitterId: currentUser.sub,
            status: SkillStatus.PENDING_REVIEW,
          },
        });

        if (normalizedDto.projectIds.length > 0) {
          await tx.skillProject.createMany({
            data: normalizedDto.projectIds.map((projectId) => ({
              skillId: created.id,
              projectId,
            })),
            skipDuplicates: true,
          });
        }

        if (normalizedDto.visibleUserIds.length > 0) {
          await tx.skillVisibleUser.createMany({
            data: normalizedDto.visibleUserIds.map((userId) => ({
              skillId: created.id,
              userId,
            })),
            skipDuplicates: true,
          });
        }

        return tx.skill.findUnique({
          where: { id: created.id },
          include: SKILL_DETAIL_INCLUDE,
        });
      });
    } catch (error) {
      await this.skillStorageService.removeStoredFile(storedPackage.relativePath);
      throw error;
    }

    if (!skill) {
      await this.skillStorageService.removeStoredFile(storedPackage.relativePath);
      throw new NotFoundException("Skill不存在");
    }

    return this.toSkillDetail(skill);
  }

  async findSubmissions(currentUser: CurrentUserPayload) {
    const where = this.buildSubmissionScope(currentUser);
    const skills = await this.prisma.skill.findMany({
      where,
      include: SKILL_DETAIL_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    return skills.map((skill) => this.toSkillSummary(skill));
  }

  async findProjectOptions() {
    const projects = await this.prisma.project.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      status: project.status,
    }));
  }

  async findCategoryOptions() {
    const categories = await this.prisma.skillCategory.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      status: category.status,
    }));
  }

  async findUserOptions() {
    const users = await this.prisma.user.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ name: "asc" }, { account: "asc" }],
    });

    return users.map((user) => ({
      id: user.id,
      account: user.account,
      name: user.name,
      status: user.status,
    }));
  }

  async findSubmission(id: string, currentUser: CurrentUserPayload) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: SKILL_DETAIL_INCLUDE,
    });

    if (!skill) {
      throw new NotFoundException("Skill不存在");
    }

    if (!this.canViewSubmission(skill, currentUser)) {
      throw new ForbiddenException("无权查看该Skill记录");
    }

    return this.toSkillDetail(skill);
  }

  async findVersions(id: string, currentUser: CurrentUserPayload) {
    const target = await this.prisma.skill.findUnique({
      where: { id },
      include: SKILL_DETAIL_INCLUDE,
    });

    if (!target) {
      throw new NotFoundException("Skill不存在");
    }

    const seriesId = target.seriesId ?? target.id;
    const canViewSubmission =
      currentUser.permissions.includes("skill.submission.view") &&
      this.canViewSubmission(target, currentUser);

    if (!canViewSubmission) {
      const visiblePublished = await this.findLibrary(currentUser);
      if (!visiblePublished.some((item) => item.seriesId === seriesId)) {
        throw new ForbiddenException("无权查看该Skill版本");
      }
    }

    const versions = await this.prisma.skill.findMany({
      where: { OR: [{ seriesId }, { id: seriesId }] },
      include: SKILL_DETAIL_INCLUDE,
      orderBy: [{ createdAt: "desc" }],
    });

    return versions.map((skill) => this.toSkillSummary(skill));
  }

  async createVersion(
    id: string,
    dto: CreateSkillVersionDto,
    packageFile: SkillStorageFileInput | undefined,
    currentUser: CurrentUserPayload,
  ) {
    const source = await this.prisma.skill.findUnique({
      where: { id },
      include: {
        projects: true,
        visibleUsers: true,
      },
    });

    if (!source) {
      throw new NotFoundException("Skill不存在");
    }

    const canManage = currentUser.permissions.includes("skill.publish");
    if (!canManage && source.submitterId !== currentUser.sub) {
      throw new ForbiddenException("仅原提交方或管理员可提交新版本");
    }

    if (source.status !== SkillStatus.PUBLISHED) {
      throw new BadRequestException("仅已发布的Skill可提交新版本");
    }

    const seriesId = source.seriesId ?? source.id;
    const duplicate = await this.prisma.skill.findFirst({
      where: {
        OR: [{ seriesId }, { id: seriesId }],
        versionLabel: dto.versionLabel,
      },
    });

    if (duplicate) {
      throw new BadRequestException("该版本号已存在");
    }

    const versionId = randomUUID();
    const storedPackage = await this.storePackageOrThrow(versionId, packageFile);

    let created: SkillWithRelations | null = null;
    try {
      created = await this.prisma.$transaction(async (tx) => {
        const skill = await tx.skill.create({
          data: {
            id: versionId,
            seriesId,
            versionLabel: dto.versionLabel,
            name: source.name,
            summary: source.summary,
            description: source.description,
            authorName: source.authorName,
            categoryId: source.categoryId,
            sourceType: source.sourceType,
            sourceUrl: source.sourceUrl,
            sourceLabel: source.sourceLabel,
            visibility: source.visibility,
            packageName: storedPackage.originalName,
            packageSizeBytes: storedPackage.sizeBytes,
            packageOriginalName: storedPackage.originalName,
            packageStoredName: storedPackage.storedName,
            packageRelativePath: storedPackage.relativePath,
            packageMimeType: storedPackage.mimeType,
            packageChecksum: storedPackage.checksum,
            packageUploadedAt: storedPackage.uploadedAt,
            changelog: dto.changelog,
            submitterId: currentUser.sub,
            status: SkillStatus.PENDING_REVIEW,
            isLatestPublished: false,
          },
        });

        if (source.projects.length > 0) {
          await tx.skillProject.createMany({
            data: source.projects.map((link) => ({
              skillId: skill.id,
              projectId: link.projectId,
            })),
            skipDuplicates: true,
          });
        }

        if (source.visibleUsers.length > 0) {
          await tx.skillVisibleUser.createMany({
            data: source.visibleUsers.map((link) => ({
              skillId: skill.id,
              userId: link.userId,
            })),
            skipDuplicates: true,
          });
        }

        return tx.skill.findUnique({
          where: { id: skill.id },
          include: SKILL_DETAIL_INCLUDE,
        });
      });
    } catch (error) {
      await this.skillStorageService.removeStoredFile(storedPackage.relativePath);
      throw error;
    }

    if (!created) {
      await this.skillStorageService.removeStoredFile(storedPackage.relativePath);
      throw new NotFoundException("Skill版本创建失败");
    }

    return this.toSkillDetail(created);
  }

  async review(id: string, dto: ReviewSkillDto, currentUser: CurrentUserPayload) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: SKILL_DETAIL_INCLUDE,
    });

    if (!skill) {
      throw new NotFoundException("Skill不存在");
    }

    if (
      skill.status !== SkillStatus.PENDING_REVIEW &&
      skill.status !== SkillStatus.IN_REVIEW
    ) {
      throw new BadRequestException("当前状态不可审核");
    }

    if (dto.action === SkillReviewAction.REJECT && !dto.comment?.trim()) {
      throw new BadRequestException("驳回时必须填写审核意见");
    }

    const updated = await this.prisma.skill.update({
      where: { id },
      data: {
        status:
          dto.action === SkillReviewAction.APPROVE ? SkillStatus.STORED : SkillStatus.REJECTED,
        reviewComment: dto.comment?.trim() || null,
        reviewedById: currentUser.sub,
        reviewedAt: new Date(),
      },
      include: SKILL_DETAIL_INCLUDE,
    });

    return this.toSkillDetail(updated);
  }

  async publish(id: string, currentUser: CurrentUserPayload) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException("Skill不存在");
    }

    if (skill.status !== SkillStatus.STORED) {
      throw new BadRequestException("仅已入库的Skill可以发布");
    }

    const seriesId = skill.seriesId ?? skill.id;
    const hadPublishedVersionBefore = await this.prisma.skill.count({
      where: {
        OR: [{ seriesId }, { id: seriesId }],
        status: SkillStatus.PUBLISHED,
      },
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.skill.updateMany({
        where: {
          OR: [{ seriesId }, { id: seriesId }],
          status: SkillStatus.PUBLISHED,
        },
        data: {
          isLatestPublished: false,
        },
      });

      const published = await tx.skill.update({
        where: { id },
        data: {
          seriesId,
          status: SkillStatus.PUBLISHED,
          isLatestPublished: true,
          publishedById: currentUser.sub,
          publishedAt: new Date(),
        },
        include: SKILL_DETAIL_INCLUDE,
      });

      if (hadPublishedVersionBefore > 0) {
        await this.notificationService.createSkillVersionReleasedNotifications({
          skillSeriesId: seriesId,
          skillId: published.id,
          skillName: published.name,
          versionLabel: published.versionLabel,
          changelog: published.changelog,
          tx,
        });
      }

      return published;
    });

    return this.toSkillDetail(updated);
  }

  async findLibrary(currentUser: CurrentUserPayload, query: SkillLibraryQuery = {}) {
    const where = await this.buildVisiblePublishedWhere(currentUser, query);

    const skills = await this.prisma.skill.findMany({
      where,
      include: SKILL_DETAIL_INCLUDE,
      orderBy: { publishedAt: "desc" },
    });

    return skills.map((skill) => this.toSkillSummary(skill));
  }

  async findLibraryDetail(id: string, currentUser: CurrentUserPayload) {
    const where = await this.buildVisiblePublishedWhere(currentUser, {});
    const skill = await this.prisma.skill.findFirst({
      where: {
        ...where,
        id,
      },
      include: SKILL_DETAIL_INCLUDE,
    });

    if (!skill) {
      throw new NotFoundException("Skill不存在或无权查看");
    }

    const versions = await this.findVersions(skill.id, currentUser);

    return {
      ...this.toSkillDetail(skill),
      versions: versions.filter((item) => item.status === "PUBLISHED"),
    };
  }

  async download(id: string, versionId: string | undefined, currentUser: CurrentUserPayload) {
    const version = await this.resolveDownloadTarget(id, versionId, currentUser);

    if (!version.packageRelativePath) {
      throw new NotFoundException("文件不存在，请联系管理员重新上传");
    }

    const stream = await this.skillStorageService.openReadStream(version.packageRelativePath);
    await this.createDownloadRecord(version, currentUser);

    return {
      stream,
      fileName: version.packageOriginalName ?? version.packageName,
      mimeType: version.packageMimeType ?? "application/zip",
    };
  }

  async recordDownload(id: string, dto: DownloadSkillDto, currentUser: CurrentUserPayload) {
    const version = await this.resolveDownloadTarget(id, dto.versionId, currentUser);
    const record = await this.createDownloadRecord(version, currentUser);

    return {
      id: record.id,
      skillId: record.skillId,
      seriesId: record.seriesId,
      versionLabel: record.versionLabel,
      downloadedAt: record.downloadedAt,
      departmentName: record.departmentName,
      downloader: {
        id: record.downloader.id,
        account: record.downloader.account,
        name: record.downloader.name,
      },
    };
  }

  async findDownloadHistory(currentUser: CurrentUserPayload) {
    const records = await this.prisma.skillDownloadRecord.findMany({
      where: { downloaderId: currentUser.sub },
      orderBy: { downloadedAt: "desc" },
      include: {
        skill: {
          include: {
            category: true,
          },
        },
      },
    });

    const grouped = new Map<string, (typeof records)[number]>();
    for (const record of records) {
      if (!grouped.has(record.seriesId)) {
        grouped.set(record.seriesId, record);
      }
    }

    const history = [];
    for (const record of grouped.values()) {
      const latest = await this.prisma.skill.findFirst({
        where: {
          OR: [{ seriesId: record.seriesId }, { id: record.seriesId }],
          status: SkillStatus.PUBLISHED,
          isLatestPublished: true,
        },
        include: {
          category: true,
        },
      });

      history.push({
        seriesId: record.seriesId,
        skillName: record.skillName,
        authorName: record.skill.authorName,
        category: latest
          ? { id: latest.category.id, name: latest.category.name }
          : { id: record.skill.category.id, name: record.skill.category.name },
        lastDownloadedVersion: record.versionLabel,
        latestPublishedVersion: latest?.versionLabel ?? record.versionLabel,
        hasNewVersion: Boolean(latest && latest.versionLabel !== record.versionLabel),
        downloadedAt: record.downloadedAt,
      });
    }

    return history;
  }

  async findDownloadRecords(currentUser: CurrentUserPayload) {
    const records = await this.prisma.skillDownloadRecord.findMany({
      where: { downloaderId: currentUser.sub },
      orderBy: { downloadedAt: "desc" },
    });

    return records.map((record) => ({
      id: record.id,
      skillId: record.skillId,
      seriesId: record.seriesId,
      skillName: record.skillName,
      versionLabel: record.versionLabel,
      departmentName: record.departmentName,
      downloadedAt: record.downloadedAt,
    }));
  }

  async submitRating(
    id: string,
    dto: SubmitSkillRatingDto,
    currentUser: CurrentUserPayload,
  ) {
    const { skill, seriesId, downloadRecord } = await this.resolveRatingTarget(id, currentUser);

    if (!downloadRecord) {
      throw new BadRequestException("下载后才能评分");
    }

    const normalizedRating = this.normalizeRating(dto.rating);
    const feedback = this.normalizeFeedback(dto.feedback);
    const rater = await this.prisma.user.findUnique({
      where: { id: currentUser.sub },
      include: {
        department: true,
      },
    });

    if (!rater) {
      throw new NotFoundException("评分用户不存在");
    }

    const existing = await this.prisma.skillRating.findUnique({
      where: {
        seriesId_raterId: {
          seriesId,
          raterId: currentUser.sub,
        },
      },
      select: { id: true },
    });

    const created = await this.prisma.skillRating.upsert({
      where: {
        seriesId_raterId: {
          seriesId,
          raterId: currentUser.sub,
        },
      },
      create: {
        seriesId,
        skillId: downloadRecord.skillId ?? skill.id,
        raterId: currentUser.sub,
        departmentId: rater.departmentId,
        departmentName: this.resolveDepartmentDisplayName(rater.department),
        rating: normalizedRating,
        feedback,
      },
      update: {
        skillId: downloadRecord.skillId ?? skill.id,
        departmentId: rater.departmentId,
        departmentName: this.resolveDepartmentDisplayName(rater.department),
        rating: normalizedRating,
        feedback,
      },
      include: SKILL_RATING_INCLUDE,
    });

    const ratingDetail = this.toSkillRatingDetail(created);

    return {
      rating: ratingDetail,
      auditLog: {
        operationType: existing ? "rate-update" : "rate-create",
        targetId: ratingDetail.id,
        detailJson: JSON.stringify({
          seriesId: ratingDetail.seriesId,
          skillId: ratingDetail.skillId,
          raterId: ratingDetail.raterId,
          rating: ratingDetail.rating,
          feedbackLength: ratingDetail.feedback.length,
        }),
      },
    };
  }

  async findRatingSummary(id: string, currentUser: CurrentUserPayload) {
    const { seriesId } = await this.resolveRatingTarget(id, currentUser);
    const ratings = await this.prisma.skillRating.findMany({
      where: { seriesId },
      select: { rating: true },
    });

    const summary = ratings.reduce(
      (acc, item) => {
        acc.totalRatings += 1;
        acc.sum += item.rating;
        if (item.rating >= 1 && item.rating <= 5) {
          acc.distribution[item.rating as 1 | 2 | 3 | 4 | 5] += 1;
        }
        return acc;
      },
      {
        sum: 0,
        totalRatings: 0,
        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        } as Record<1 | 2 | 3 | 4 | 5, number>,
      },
    );

    return {
      seriesId,
      totalRatings: summary.totalRatings,
      averageRating:
        summary.totalRatings > 0 ? Number((summary.sum / summary.totalRatings).toFixed(2)) : 0,
      distribution: summary.distribution,
    };
  }

  async findMyRating(id: string, currentUser: CurrentUserPayload) {
    const { seriesId } = await this.resolveRatingTarget(id, currentUser);
    const rating = await this.prisma.skillRating.findUnique({
      where: {
        seriesId_raterId: {
          seriesId,
          raterId: currentUser.sub,
        },
      },
      include: SKILL_RATING_INCLUDE,
    });

    return rating ? this.toSkillRatingDetail(rating) : null;
  }

  async findRatings(id: string, currentUser: CurrentUserPayload) {
    const { seriesId } = await this.resolveRatingTarget(id, currentUser);
    const ratings = await this.prisma.skillRating.findMany({
      where: { seriesId },
      orderBy: { updatedAt: "desc" },
      include: SKILL_RATING_INCLUDE,
    });

    return ratings.map((rating) => this.toSkillRatingDetail(rating));
  }

  private async buildVisiblePublishedWhere(
    currentUser: CurrentUserPayload,
    query: SkillLibraryQuery,
  ): Promise<Prisma.SkillWhereInput> {
    const isManager = currentUser.permissions.includes("skill.publish");
    const projectLinks = await this.prisma.projectMember.findMany({
      where: { userId: currentUser.sub },
      select: { projectId: true },
    });
    const projectIds = projectLinks.map((link) => link.projectId);

    const where: Prisma.SkillWhereInput = {
      status: SkillStatus.PUBLISHED,
      isLatestPublished: true,
    };

    if (query.keyword?.trim()) {
      const keyword = query.keyword.trim();
      this.appendAnd(where, {
        OR: [
          { name: { contains: keyword } },
          { summary: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      });
    }

    if (query.categoryId?.trim()) {
      this.appendAnd(where, { categoryId: query.categoryId.trim() });
    }

    if (
      query.sourceType?.trim() &&
      (query.sourceType === SkillSourceType.INTERNAL || query.sourceType === SkillSourceType.EXTERNAL)
    ) {
      this.appendAnd(where, { sourceType: query.sourceType });
    }

    if (!isManager) {
      where.OR = [
        { visibility: SkillVisibility.ALL_USERS },
        {
          visibility: SkillVisibility.PROJECT_MEMBERS,
          projects: {
            some: {
              projectId: { in: projectIds.length > 0 ? projectIds : ["__never__"] },
            },
          },
        },
        {
          visibility: SkillVisibility.SPECIFIED_USERS,
          visibleUsers: {
            some: { userId: currentUser.sub },
          },
        },
      ];
    }
    return where;
  }

  private async resolveDownloadTarget(
    id: string,
    versionId: string | undefined,
    currentUser: CurrentUserPayload,
  ) {
    const visibleWhere = await this.buildVisiblePublishedWhere(currentUser, {});
    const latestVisible = await this.prisma.skill.findFirst({
      where: {
        ...visibleWhere,
        OR: [{ id }, { seriesId: id }],
      },
      include: SKILL_DETAIL_INCLUDE,
    });

    if (!latestVisible) {
      throw new NotFoundException("下载版本不存在或不可见");
    }

    const seriesId = latestVisible.seriesId ?? latestVisible.id;
    const targetVersionId = versionId ?? latestVisible.id;
    const version = await this.prisma.skill.findFirst({
      where: {
        id: targetVersionId,
        OR: [{ seriesId }, { id: seriesId }],
        status: SkillStatus.PUBLISHED,
      },
      include: SKILL_DETAIL_INCLUDE,
    });

    if (!version) {
      throw new NotFoundException("下载版本不存在或不可见");
    }

    return version;
  }

  private async createDownloadRecord(version: SkillWithRelations, currentUser: CurrentUserPayload) {
    const downloader = await this.prisma.user.findUnique({
      where: { id: currentUser.sub },
      include: { department: true },
    });

    if (!downloader) {
      throw new NotFoundException("下载用户不存在");
    }

    return this.prisma.skillDownloadRecord.create({
      data: {
        skillId: version.id,
        seriesId: version.seriesId ?? version.id,
        downloaderId: downloader.id,
        departmentId: downloader.departmentId,
        departmentName: downloader.department.name,
        skillName: version.name,
        versionLabel: version.versionLabel,
      },
      include: {
        downloader: true,
      },
    });
  }

  private async resolveRatingTarget(id: string, currentUser: CurrentUserPayload) {
    const where = await this.buildVisiblePublishedWhere(currentUser, {});
    const skill = await this.prisma.skill.findFirst({
      where: {
        ...where,
        OR: [{ id }, { seriesId: id }],
      },
      include: SKILL_DETAIL_INCLUDE,
    });

    if (!skill) {
      throw new NotFoundException("Skill不存在或无权查看");
    }

    const seriesId = skill.seriesId ?? skill.id;
    const downloadRecord = await this.prisma.skillDownloadRecord.findFirst({
      where: {
        seriesId,
        downloaderId: currentUser.sub,
      },
      orderBy: { downloadedAt: "desc" },
    });

    return { skill, seriesId, downloadRecord };
  }

  private normalizeRating(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new BadRequestException("评分必须在1到5之间");
    }

    return value;
  }

  private normalizeFeedback(value: string) {
    const feedback = value.trim();

    if (!feedback) {
      throw new BadRequestException("反馈内容不能为空");
    }

    return feedback;
  }

  private resolveDepartmentDisplayName(
    department: { code: string; name: string } | null | undefined,
  ) {
    if (!department) {
      return "";
    }

    return department.code === "root" ? "总部" : department.name;
  }

  private toSkillRatingDetail(rating: SkillRatingWithRelations) {
    return {
      id: rating.id,
      seriesId: rating.seriesId,
      skillId: rating.skillId,
      raterId: rating.raterId,
      rating: rating.rating,
      feedback: rating.feedback,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
      rater: {
        id: rating.rater.id,
        account: rating.rater.account,
        name: rating.rater.name,
        departmentName:
          this.resolveDepartmentDisplayName(rating.department) ||
          this.resolveDepartmentDisplayName(rating.rater.department) ||
          rating.departmentName ||
          "",
      },
    };
  }

  private appendAnd(where: Prisma.SkillWhereInput, condition: Prisma.SkillWhereInput) {
    const currentAnd = Array.isArray(where.AND)
      ? where.AND
      : where.AND
        ? [where.AND]
        : [];
    where.AND = [...currentAnd, condition];
  }

  private async ensureCreatePayloadIsValid(dto: CreateSkillDto) {
    const category = await this.prisma.skillCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category || category.status !== "ACTIVE") {
      throw new NotFoundException("Skill分类不存在");
    }

    if (dto.sourceType === SkillSourceType.EXTERNAL) {
      if (!dto.sourceUrl?.trim() || !dto.sourceLabel?.trim()) {
        throw new BadRequestException("外部平台Skill必须填写来源网址和来源网址名称");
      }
    }

    if (dto.visibility === SkillVisibility.PROJECT_MEMBERS && dto.projectIds.length === 0) {
      throw new BadRequestException("按项目成员可见时必须关联项目");
    }

    if (dto.visibility === SkillVisibility.SPECIFIED_USERS && dto.visibleUserIds.length === 0) {
      throw new BadRequestException("指定账号可见时必须选择可见账号");
    }

    if (dto.projectIds.length > 0) {
      const projects = await this.prisma.project.findMany({
        where: {
          id: { in: dto.projectIds },
          status: "ACTIVE",
        },
      });

      if (projects.length !== dto.projectIds.length) {
        throw new NotFoundException("关联项目不存在");
      }
    }

    if (dto.visibleUserIds.length > 0) {
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: dto.visibleUserIds },
          status: "ACTIVE",
        },
      });

      if (users.length !== dto.visibleUserIds.length) {
        throw new NotFoundException("可见账号不存在");
      }
    }
  }

  private async storePackageOrThrow(
    skillId: string,
    packageFile: SkillStorageFileInput | undefined,
  ) {
    if (!packageFile) {
      throw new BadRequestException("请上传 Zip 包");
    }

    return this.skillStorageService.saveSkillPackage({
      skillId,
      file: packageFile,
    });
  }

  private normalizeCreateDto(dto: CreateSkillDto): CreateSkillDto {
    return {
      ...dto,
      projectIds: this.normalizeStringArray(dto.projectIds),
      visibleUserIds: this.normalizeStringArray(dto.visibleUserIds),
    };
  }

  private normalizeStringArray(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .flatMap((item) => this.normalizeStringArray(item))
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof value !== "string") {
      return [];
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return this.normalizeStringArray(parsed);
      } catch {
        return [];
      }
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private buildSubmissionScope(currentUser: CurrentUserPayload): Prisma.SkillWhereInput {
    const canViewAll =
      currentUser.permissions.includes("skill.review") ||
      currentUser.permissions.includes("skill.publish");

    if (canViewAll) {
      return {};
    }

    return { submitterId: currentUser.sub };
  }

  private canViewSubmission(skill: Skill, currentUser: CurrentUserPayload) {
    return (
      currentUser.permissions.includes("skill.review") ||
      currentUser.permissions.includes("skill.publish") ||
      skill.submitterId === currentUser.sub
    );
  }

  private toSkillSummary(skill: SkillWithRelations) {
    return {
      id: skill.id,
      seriesId: skill.seriesId ?? skill.id,
      versionLabel: skill.versionLabel,
      name: skill.name,
      summary: skill.summary,
      authorName: skill.authorName,
      status: skill.status,
      visibility: skill.visibility,
      sourceType: skill.sourceType,
      sourceLabel: skill.sourceLabel,
      category: {
        id: skill.category.id,
        name: skill.category.name,
      },
      projects: skill.projects.map((link) => ({
        id: link.project.id,
        name: link.project.name,
      })),
      submitter: {
        id: skill.submitter.id,
        account: skill.submitter.account,
        name: skill.submitter.name,
      },
      createdAt: skill.createdAt,
      reviewedAt: skill.reviewedAt,
      publishedAt: skill.publishedAt,
    };
  }

  private toSkillDetail(skill: SkillWithRelations) {
    return {
      ...this.toSkillSummary(skill),
      description: skill.description,
      sourceUrl: skill.sourceUrl,
      packageName: skill.packageName,
      packageSizeBytes: skill.packageSizeBytes,
      packageOriginalName: skill.packageOriginalName,
      packageStoredName: skill.packageStoredName,
      packageRelativePath: skill.packageRelativePath,
      packageMimeType: skill.packageMimeType,
      packageChecksum: skill.packageChecksum,
      packageUploadedAt: skill.packageUploadedAt,
      changelog: skill.changelog,
      reviewComment: skill.reviewComment,
      visibleUsers: skill.visibleUsers.map((link) => ({
        id: link.user.id,
        account: link.user.account,
        name: link.user.name,
      })),
      reviewedBy: skill.reviewedBy
        ? {
            id: skill.reviewedBy.id,
            account: skill.reviewedBy.account,
            name: skill.reviewedBy.name,
          }
        : null,
      publishedBy: skill.publishedBy
        ? {
            id: skill.publishedBy.id,
            account: skill.publishedBy.account,
            name: skill.publishedBy.name,
          }
        : null,
    };
  }
}
