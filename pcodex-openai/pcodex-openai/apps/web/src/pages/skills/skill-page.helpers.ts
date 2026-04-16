export type SkillSourceType = "INTERNAL" | "EXTERNAL";
export type SkillVisibility = "ALL_USERS" | "PROJECT_MEMBERS" | "SPECIFIED_USERS";
export type SkillStatus =
  | "PENDING_REVIEW"
  | "IN_REVIEW"
  | "STORED"
  | "PUBLISHED"
  | "OFFLINE"
  | "REJECTED";
export type SkillRatingLevel = 1 | 2 | 3 | 4 | 5;

export interface SkillFormState {
  name: string;
  summary: string;
  description: string;
  authorName: string;
  categoryId: string;
  sourceType: SkillSourceType;
  sourceUrl: string;
  sourceLabel: string;
  visibility: SkillVisibility;
  projectIds: string[];
  visibleUserIds: string[];
  packageFile: File | null;
  changelog: string;
}

export interface SkillVersionFormState {
  versionLabel: string;
  packageFile: File | null;
  changelog: string;
}

export interface SkillRatingSummary {
  seriesId: string;
  averageRating: number;
  totalRatings: number;
  distribution: Record<SkillRatingLevel, number>;
}

export interface SkillRatingDetail {
  id: string;
  seriesId: string;
  skillId: string | null;
  raterId: string;
  rating: SkillRatingLevel;
  feedback: string;
  createdAt: string;
  updatedAt: string;
  rater: {
    id: string;
    account: string;
    name: string;
    departmentName: string;
  };
}

export interface SkillRatingFormState {
  rating: SkillRatingLevel | null;
  feedback: string;
}

export interface SkillRatingDistributionRow {
  rating: SkillRatingLevel;
  label: string;
  count: number;
  percent: number;
}

export interface SkillLibraryFilters {
  keyword: string;
  categoryId: string;
  sourceType: string;
}

export function buildSkillFormData(form: SkillFormState) {
  const payload = new FormData();

  payload.set("name", form.name.trim());
  payload.set("summary", form.summary.trim());
  payload.set("description", form.description.trim());
  payload.set("authorName", form.authorName.trim());
  payload.set("categoryId", form.categoryId);
  payload.set("sourceType", form.sourceType);
  payload.set("visibility", form.visibility);
  payload.set("projectIds", JSON.stringify(form.projectIds));
  payload.set("visibleUserIds", JSON.stringify(form.visibleUserIds));
  payload.set("changelog", form.changelog.trim());

  if (form.sourceType === "EXTERNAL") {
    payload.set("sourceUrl", form.sourceUrl.trim());
    payload.set("sourceLabel", form.sourceLabel.trim());
  }

  if (form.packageFile) {
    payload.set("packageFile", form.packageFile);
  }

  return payload;
}

export function buildSkillVersionFormData(form: SkillVersionFormState) {
  const payload = new FormData();
  payload.set("versionLabel", form.versionLabel.trim());
  payload.set("changelog", form.changelog.trim());

  if (form.packageFile) {
    payload.set("packageFile", form.packageFile);
  }

  return payload;
}

export function formatPackageSize(sizeBytes: number) {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  if (sizeBytes >= 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${sizeBytes} B`;
}

export function buildSkillLibraryQuery(filters: SkillLibraryFilters) {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set("keyword", filters.keyword.trim());
  }

  if (filters.categoryId.trim()) {
    params.set("categoryId", filters.categoryId.trim());
  }

  if (filters.sourceType.trim()) {
    params.set("sourceType", filters.sourceType.trim());
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function canReviewSkill(status: SkillStatus, permissions: string[]) {
  return permissions.includes("skill.review") && ["PENDING_REVIEW", "IN_REVIEW"].includes(status);
}

export function canPublishSkill(status: SkillStatus, permissions: string[]) {
  return permissions.includes("skill.publish") && status === "STORED";
}

export function canDownloadSkill(permissions: string[]) {
  return permissions.includes("skill.download");
}

export function canViewDownloadHistory(permissions: string[]) {
  return permissions.includes("skill.download-history.view");
}

export function canRateSkill(permissions: string[]) {
  return permissions.includes("skill.rate");
}

export function canViewSkillRatings(permissions: string[]) {
  return permissions.includes("skill.rating.view");
}

export function buildRatingDistributionRows(
  distribution: Partial<Record<SkillRatingLevel, number>> | null | undefined,
  totalRatings: number,
) {
  const levels: SkillRatingLevel[] = [5, 4, 3, 2, 1];

  return levels.map((rating) => {
    const count = distribution?.[rating] ?? 0;
    return {
      rating,
      label: `${rating} 分`,
      count,
      percent: totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0,
    } satisfies SkillRatingDistributionRow;
  });
}

export function formatRatingAverage(averageRating: number, totalRatings: number) {
  if (totalRatings <= 0) {
    return "暂无评分";
  }

  return `${averageRating.toFixed(1)} 分`;
}

export function canSubmitSkillVersion(
  status: SkillStatus,
  submitterId: string,
  currentUserId: string,
  permissions: string[],
) {
  return (
    status === "PUBLISHED" &&
    permissions.includes("skill.submit") &&
    (submitterId === currentUserId || permissions.includes("skill.publish"))
  );
}
