import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "@jest/globals";
import {
  PrismaClient,
  NotificationType,
  SkillSourceType,
  SkillStatus,
  SkillVisibility,
} from "@prisma/client";

type SkillRatingFixture = {
  homeDepartmentId: string;
  ratingDepartmentId: string;
  categoryId: string;
  userId: string;
  skillId: string;
  seriesId: string;
  ratingId: string;
};

type NotificationFixture = {
  departmentId: string;
  userId: string;
  notificationId: string;
  skillSeriesId: string;
};

async function createSkillRatingFixture(
  prisma: PrismaClient,
  overrides?: {
    seriesId?: string;
    versionLabel?: string;
  },
): Promise<SkillRatingFixture> {
  const suffix = randomUUID().replace(/-/g, "");
  const seriesId = overrides?.seriesId ?? `series-${suffix}`;
  const versionLabel = overrides?.versionLabel ?? "1.0.0";
  const homeDepartment = await prisma.department.create({
    data: {
      code: `home-${suffix}`,
      name: `Home ${suffix}`,
    },
  });
  const ratingDepartment = await prisma.department.create({
    data: {
      code: `rating-${suffix}`,
      name: `Rating ${suffix}`,
    },
  });
  const category = await prisma.skillCategory.create({
    data: {
      code: `category-${suffix}`,
      name: `Category ${suffix}`,
    },
  });
  const user = await prisma.user.create({
    data: {
      account: `user-${suffix}`,
      name: `User ${suffix}`,
      passwordHash: "password-hash",
      departmentId: homeDepartment.id,
    },
  });
  const skill = await prisma.skill.create({
    data: {
      seriesId,
      versionLabel,
      name: `Skill ${suffix}`,
      summary: "summary",
      description: "description",
      authorName: "author",
      categoryId: category.id,
      sourceType: SkillSourceType.INTERNAL,
      visibility: SkillVisibility.ALL_USERS,
      packageName: `package-${suffix}`,
      packageSizeBytes: 1,
      changelog: "changelog",
      submitterId: user.id,
      status: SkillStatus.STORED,
    },
  });
  const rating = await prisma.skillRating.create({
    data: {
      seriesId,
      skillId: skill.id,
      raterId: user.id,
      departmentId: ratingDepartment.id,
      departmentName: ratingDepartment.name,
      rating: 4,
      feedback: "helpful",
    },
  });

  return {
    homeDepartmentId: homeDepartment.id,
    ratingDepartmentId: ratingDepartment.id,
    categoryId: category.id,
    userId: user.id,
    skillId: skill.id,
    seriesId,
    ratingId: rating.id,
  };
}

async function cleanupSkillRatingFixture(
  prisma: PrismaClient,
  fixture: SkillRatingFixture,
): Promise<void> {
  await prisma.skillRating.deleteMany({ where: { id: fixture.ratingId } });
  await prisma.skill.deleteMany({ where: { id: fixture.skillId } });
  await prisma.user.deleteMany({ where: { id: fixture.userId } });
  await prisma.skillCategory.deleteMany({ where: { id: fixture.categoryId } });
  await prisma.department.deleteMany({
    where: {
      id: { in: [fixture.homeDepartmentId, fixture.ratingDepartmentId] },
    },
  });
}

async function createNotificationFixture(
  prisma: PrismaClient,
): Promise<NotificationFixture> {
  const suffix = randomUUID().replace(/-/g, "");
  const department = await prisma.department.create({
    data: {
      code: `notification-dept-${suffix}`,
      name: `Notification Dept ${suffix}`,
    },
  });
  const user = await prisma.user.create({
    data: {
      account: `notification-user-${suffix}`,
      name: `Notification User ${suffix}`,
      passwordHash: "password-hash",
      departmentId: department.id,
    },
  });
  const skillSeriesId = `notification-series-${suffix}`;
  const notification = await prisma.notification.create({
    data: {
      userId: user.id,
      type: NotificationType.SKILL_VERSION_RELEASED,
      title: `Skill released ${suffix}`,
      content: `Skill ${suffix} has a new version.`,
      skillSeriesId,
      skillId: `skill-${suffix}`,
      versionLabel: "1.0.1",
    },
  });

  return {
    departmentId: department.id,
    userId: user.id,
    notificationId: notification.id,
    skillSeriesId,
  };
}

async function cleanupNotificationFixture(
  prisma: PrismaClient,
  fixture: NotificationFixture,
): Promise<void> {
  await prisma.notification.deleteMany({
    where: { id: fixture.notificationId },
  });
  await prisma.user.deleteMany({ where: { id: fixture.userId } });
  await prisma.department.deleteMany({ where: { id: fixture.departmentId } });
}

describe("schema smoke", () => {
  it("exposes users, roles, permissions, departments, projects, categories, and logs", async () => {
    const prisma = new PrismaClient();

    expect(prisma.user).toBeDefined();
    expect(prisma.role).toBeDefined();
    expect(prisma.permission).toBeDefined();
    expect(prisma.department).toBeDefined();
    expect(prisma.project).toBeDefined();
    expect(prisma.skillCategory).toBeDefined();
    expect(prisma.loginLog).toBeDefined();
    expect(prisma.operationLog).toBeDefined();
    expect(prisma.skillRating).toBeDefined();

    await prisma.$disconnect();
  });

  it("includes skill package metadata fields in prisma schema", async () => {
    const schemaPath = path.resolve(__dirname, "..", "prisma", "schema.prisma");
    const schema = await fs.readFile(schemaPath, "utf8");

    expect(schema).toContain("packageOriginalName");
    expect(schema).toContain("packageStoredName");
    expect(schema).toContain("packageRelativePath");
    expect(schema).toContain("packageMimeType");
    expect(schema).toContain("packageChecksum");
    expect(schema).toContain("packageUploadedAt");
  });

  it("can create and read skill ratings through Prisma client", async () => {
    const prisma = new PrismaClient();
    const fixture = await createSkillRatingFixture(prisma);

    const rating = await prisma.skillRating.findUnique({
      where: { id: fixture.ratingId },
    });

    expect(rating).not.toBeNull();
    expect(rating?.seriesId).toBe(fixture.seriesId);
    expect(rating?.rating).toBe(4);
    expect(rating?.departmentName).toContain("Rating");

    await cleanupSkillRatingFixture(prisma, fixture);
    await prisma.$disconnect();
  });

  it("enforces one rating per series and rater", async () => {
    const prisma = new PrismaClient();
    const fixture = await createSkillRatingFixture(prisma);
    const duplicateSkill = await prisma.skill.create({
      data: {
        seriesId: fixture.seriesId,
        versionLabel: "1.0.1",
        name: `Duplicate Skill ${fixture.seriesId}`,
        summary: "summary",
        description: "description",
        authorName: "author",
        categoryId: fixture.categoryId,
        sourceType: SkillSourceType.INTERNAL,
        visibility: SkillVisibility.ALL_USERS,
        packageName: `package-duplicate-${fixture.seriesId}`,
        packageSizeBytes: 1,
        changelog: "changelog",
        submitterId: fixture.userId,
        status: SkillStatus.STORED,
      },
    });

    await expect(
      prisma.skillRating.create({
        data: {
          seriesId: fixture.seriesId,
          skillId: duplicateSkill.id,
          raterId: fixture.userId,
          departmentId: fixture.ratingDepartmentId,
          departmentName: "Duplicate department",
          rating: 5,
          feedback: "duplicate",
        },
      }),
    ).rejects.toMatchObject({ code: "P2002" });

    await prisma.skill.deleteMany({ where: { id: duplicateSkill.id } });
    await cleanupSkillRatingFixture(prisma, fixture);
    await prisma.$disconnect();
  });

  it("keeps skill rating history when the skill is deleted", async () => {
    const prisma = new PrismaClient();
    const fixture = await createSkillRatingFixture(prisma);

    await prisma.skill.delete({ where: { id: fixture.skillId } });

    const rating = await prisma.skillRating.findUnique({
      where: { id: fixture.ratingId },
    });

    expect(rating).not.toBeNull();
    expect(rating?.skillId).toBeNull();
    expect(rating?.seriesId).toBe(fixture.seriesId);

    await cleanupSkillRatingFixture(prisma, fixture);
    await prisma.$disconnect();
  });

  it("keeps department snapshot data when the department is deleted", async () => {
    const prisma = new PrismaClient();
    const fixture = await createSkillRatingFixture(prisma);

    await prisma.department.delete({ where: { id: fixture.ratingDepartmentId } });

    const rating = await prisma.skillRating.findUnique({
      where: { id: fixture.ratingId },
    });

    expect(rating).not.toBeNull();
    expect(rating?.departmentId).toBeNull();
    expect(rating?.departmentName).toContain("Rating");

    await cleanupSkillRatingFixture(prisma, fixture);
    await prisma.$disconnect();
  });

  it("can create and read notifications through Prisma client", async () => {
    const prisma = new PrismaClient();
    const fixture = await createNotificationFixture(prisma);

    const notification = await prisma.notification.findUnique({
      where: { id: fixture.notificationId },
    });

    expect(notification).not.toBeNull();
    expect(notification?.type).toBe(NotificationType.SKILL_VERSION_RELEASED);
    expect(notification?.isRead).toBe(false);
    expect(notification?.skillSeriesId).toBe(fixture.skillSeriesId);

    await cleanupNotificationFixture(prisma, fixture);
    await prisma.$disconnect();
  });
});
