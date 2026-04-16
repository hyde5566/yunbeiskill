import { describe, expect, it } from "vitest";
import {
  buildRatingDistributionRows,
  buildSkillLibraryQuery,
  buildSkillFormData,
  buildSkillVersionFormData,
  canRateSkill,
  canDownloadSkill,
  canPublishSkill,
  canReviewSkill,
  canSubmitSkillVersion,
  canViewDownloadHistory,
  canViewSkillRatings,
  formatRatingAverage,
  formatPackageSize,
  type SkillFormState,
  type SkillLibraryFilters,
  type SkillVersionFormState,
} from "./skill-page.helpers";

describe("skill page helpers", () => {
  it("builds an external skill multipart payload with selected visibility targets", () => {
    const zipFile = new File(["zip-content"], "flow.zip", { type: "application/zip" });
    const form: SkillFormState = {
      name: "  Flow Skill  ",
      summary: "  Summary  ",
      description: "Detailed description",
      authorName: "管理员",
      categoryId: "cat-1",
      sourceType: "EXTERNAL",
      sourceUrl: "https://example.com/skill",
      sourceLabel: "example.com",
      visibility: "SPECIFIED_USERS",
      projectIds: ["project-1"],
      visibleUserIds: ["user-1", "user-2"],
      packageFile: zipFile,
      changelog: "  Initial release  ",
    };

    const payload = buildSkillFormData(form);

    expect(payload.get("name")).toBe("Flow Skill");
    expect(payload.get("summary")).toBe("Summary");
    expect(payload.get("sourceUrl")).toBe("https://example.com/skill");
    expect(payload.get("sourceLabel")).toBe("example.com");
    expect(payload.get("projectIds")).toBe(JSON.stringify(["project-1"]));
    expect(payload.get("visibleUserIds")).toBe(JSON.stringify(["user-1", "user-2"]));
    expect(payload.get("changelog")).toBe("Initial release");
    expect(payload.get("packageFile")).toBe(zipFile);
  });

  it("clears external source fields for internal skills", () => {
    const form: SkillFormState = {
      name: "Internal Skill",
      summary: "Summary",
      description: "Description",
      authorName: "管理员",
      categoryId: "cat-1",
      sourceType: "INTERNAL",
      sourceUrl: "https://unused.example.com",
      sourceLabel: "unused.example.com",
      visibility: "ALL_USERS",
      projectIds: [],
      visibleUserIds: [],
      packageFile: new File(["zip-content"], "internal.zip", { type: "application/zip" }),
      changelog: "Init",
    };

    const payload = buildSkillFormData(form);

    expect(payload.get("sourceUrl")).toBeNull();
    expect(payload.get("sourceLabel")).toBeNull();
  });

  it("derives review and publish actions from permissions and status", () => {
    expect(canReviewSkill("PENDING_REVIEW", ["skill.review"])).toBe(true);
    expect(canReviewSkill("PUBLISHED", ["skill.review"])).toBe(false);
    expect(canPublishSkill("STORED", ["skill.publish"])).toBe(true);
    expect(canPublishSkill("PENDING_REVIEW", ["skill.publish"])).toBe(false);
  });

  it("builds a version submission multipart payload", () => {
    const zipFile = new File(["zip-content"], "skill-v1.1.0.zip", { type: "application/zip" });
    const form: SkillVersionFormState = {
      versionLabel: " 1.1.0 ",
      packageFile: zipFile,
      changelog: " Added improvements ",
    };

    const payload = buildSkillVersionFormData(form);

    expect(payload.get("versionLabel")).toBe("1.1.0");
    expect(payload.get("changelog")).toBe("Added improvements");
    expect(payload.get("packageFile")).toBe(zipFile);
  });

  it("allows original submitter or manager to submit a new version for published skills", () => {
    expect(canSubmitSkillVersion("PUBLISHED", "user-1", "user-1", ["skill.submit"])).toBe(true);
    expect(canSubmitSkillVersion("PUBLISHED", "user-1", "user-2", ["skill.submit"])).toBe(false);
    expect(canSubmitSkillVersion("PUBLISHED", "user-1", "user-2", ["skill.submit", "skill.publish"])).toBe(true);
    expect(canSubmitSkillVersion("STORED", "user-1", "user-1", ["skill.submit"])).toBe(false);
  });

  it("builds a library query string from non-empty filters", () => {
    const filters: SkillLibraryFilters = {
      keyword: " project helper ",
      categoryId: "cat-1",
      sourceType: "INTERNAL",
    };

    expect(buildSkillLibraryQuery(filters)).toBe("?keyword=project+helper&categoryId=cat-1&sourceType=INTERNAL");
  });

  it("omits empty library filters", () => {
    const filters: SkillLibraryFilters = {
      keyword: "   ",
      categoryId: "",
      sourceType: "",
    };

    expect(buildSkillLibraryQuery(filters)).toBe("");
  });

  it("allows downloads when the user has skill.download permission", () => {
    expect(canDownloadSkill(["skill.download"])).toBe(true);
    expect(canDownloadSkill(["skill.library.view"])).toBe(false);
  });

  it("allows viewing download history when the user has skill.download-history.view permission", () => {
    expect(canViewDownloadHistory(["skill.download-history.view"])).toBe(true);
    expect(canViewDownloadHistory(["skill.library.view"])).toBe(false);
  });

  it("detects rating permissions", () => {
    expect(canRateSkill(["skill.rate"])).toBe(true);
    expect(canRateSkill(["skill.rating.view"])).toBe(false);
    expect(canViewSkillRatings(["skill.rating.view"])).toBe(true);
    expect(canViewSkillRatings(["skill.rate"])).toBe(false);
  });

  it("builds rating distribution rows in descending order", () => {
    const rows = buildRatingDistributionRows({ 1: 1, 3: 2, 5: 7 }, 10);

    expect(rows).toEqual([
      { rating: 5, label: "5 分", count: 7, percent: 70 },
      { rating: 4, label: "4 分", count: 0, percent: 0 },
      { rating: 3, label: "3 分", count: 2, percent: 20 },
      { rating: 2, label: "2 分", count: 0, percent: 0 },
      { rating: 1, label: "1 分", count: 1, percent: 10 },
    ]);
  });

  it("formats rating averages for display", () => {
    expect(formatRatingAverage(4.25, 0)).toBe("暂无评分");
    expect(formatRatingAverage(4.25, 8)).toBe("4.3 分");
  });

  it("formats package sizes for display", () => {
    expect(formatPackageSize(512)).toBe("512 B");
    expect(formatPackageSize(2048)).toBe("2.0 KB");
    expect(formatPackageSize(3 * 1024 * 1024)).toBe("3.00 MB");
  });
});
