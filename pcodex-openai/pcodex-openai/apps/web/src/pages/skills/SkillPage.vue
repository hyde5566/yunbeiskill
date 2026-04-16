<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { apiDownload, apiRequest } from "../../api/client";
import { useAuthStore } from "../../stores/auth";
import { loadPersistedFilters, savePersistedFilters } from "../../utils/persisted-filters";
import {
  buildRatingDistributionRows,
  buildSkillLibraryQuery,
  buildSkillFormData,
  buildSkillVersionFormData,
  canRateSkill,
  canPublishSkill,
  canReviewSkill,
  canDownloadSkill,
  canViewSkillRatings,
  canSubmitSkillVersion,
  canViewDownloadHistory as hasDownloadHistoryPermission,
  formatRatingAverage,
  formatPackageSize,
  type SkillFormState,
  type SkillLibraryFilters,
  type SkillRatingDetail,
  type SkillRatingFormState,
  type SkillRatingLevel,
  type SkillRatingSummary,
  type SkillStatus,
  type SkillVisibility,
  type SkillVersionFormState,
} from "./skill-page.helpers";

const SKILL_LIBRARY_FILTER_STORAGE_KEY = "yunbei:skills:library-filters";

interface SkillCategoryOption {
  id: string;
  name: string;
  status: string;
}

interface ProjectOption {
  id: string;
  name: string;
  status: string;
}

interface UserOption {
  id: string;
  account: string;
  name: string;
  status: string;
}

interface SkillListRow {
  id: string;
  seriesId: string;
  versionLabel: string;
  name: string;
  summary: string;
  authorName: string;
  status: SkillStatus;
  visibility: SkillVisibility;
  sourceType: "INTERNAL" | "EXTERNAL";
  sourceLabel: string | null;
  category: { id: string; name: string };
  projects: Array<{ id: string; name: string }>;
  submitter: { id: string; account: string; name: string };
  createdAt: string;
  reviewedAt: string | null;
  publishedAt: string | null;
}

interface SkillDetailRow extends SkillListRow {
  description: string;
  sourceUrl: string | null;
  packageName: string;
  packageSizeBytes: number;
  packageOriginalName: string | null;
  packageStoredName: string | null;
  packageRelativePath: string | null;
  packageMimeType: string | null;
  packageChecksum: string | null;
  packageUploadedAt: string | null;
  changelog: string;
  reviewComment: string | null;
  visibleUsers: Array<{ id: string; account: string; name: string }>;
  versions: SkillListRow[];
}

interface SkillDownloadHistoryRow {
  seriesId: string;
  skillName: string;
  authorName: string;
  category: { id: string; name: string };
  lastDownloadedVersion: string;
  latestPublishedVersion: string;
  hasNewVersion: boolean;
  downloadedAt: string;
}

interface SkillDownloadRecordRow {
  id: string;
  skillId: string;
  seriesId: string;
  skillName: string;
  versionLabel: string;
  departmentName: string;
  downloadedAt: string;
}

type SkillWorkspaceTab = "submit" | "review" | "library" | "downloads";

const authStore = useAuthStore();
const route = useRoute();
const loading = ref(false);
const submitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const categories = ref<SkillCategoryOption[]>([]);
const projects = ref<ProjectOption[]>([]);
const users = ref<UserOption[]>([]);
const submissions = ref<SkillListRow[]>([]);
const libraryItems = ref<SkillListRow[]>([]);
const downloadHistory = ref<SkillDownloadHistoryRow[]>([]);
const downloadRecords = ref<SkillDownloadRecordRow[]>([]);
const reviewSubmittingId = ref("");
const publishSubmittingId = ref("");
const downloadSubmittingId = ref("");
const versionSubmittingId = ref("");
const versionLoadingId = ref("");
const versionRows = reactive<Record<string, SkillListRow[]>>({});
const versionForms = reactive<Record<string, SkillVersionFormState>>({});
const libraryFilters = reactive<SkillLibraryFilters>({
  keyword: "",
  categoryId: "",
  sourceType: "",
});
const detailLoadingId = ref("");
const selectedDetail = ref<SkillDetailRow | null>(null);
const ratingLoading = ref(false);
const ratingSubmitting = ref(false);
const ratingSummary = ref<SkillRatingSummary | null>(null);
const myRating = ref<SkillRatingDetail | null>(null);
const ratingRows = ref<SkillRatingDetail[]>([]);
const ratingLevels: SkillRatingLevel[] = [1, 2, 3, 4, 5];
const workspaceTab = ref<SkillWorkspaceTab>("submit");

const reviewComments = reactive<Record<string, string>>({});
const form = reactive<SkillFormState>({
  name: "",
  summary: "",
  description: "",
  authorName: authStore.currentUser?.name ?? "",
  categoryId: "",
  sourceType: "INTERNAL",
  sourceUrl: "",
  sourceLabel: "",
  visibility: "ALL_USERS",
  projectIds: [],
  visibleUserIds: [],
  packageFile: null,
  changelog: "",
});

const permissions = computed(() => authStore.currentUser?.permissions ?? []);
const canSubmit = computed(() => permissions.value.includes("skill.submit"));
const canViewSubmissions = computed(() => permissions.value.includes("skill.submission.view"));
const canViewLibrary = computed(() => permissions.value.includes("skill.library.view"));
const canRate = computed(() => canRateSkill(permissions.value));
const canViewRatings = computed(() => canViewSkillRatings(permissions.value));
const canDownload = computed(() => canDownloadSkill(permissions.value));
const canViewDownloadHistory = computed(() => hasDownloadHistoryPermission(permissions.value));
const showRatingSection = computed(() => canRate.value || canViewRatings.value);
const ratingDistributionRows = computed(() =>
  buildRatingDistributionRows(ratingSummary.value?.distribution, ratingSummary.value?.totalRatings ?? 0),
);
const workspaceTabs = computed<Array<{ key: SkillWorkspaceTab; label: string }>>(() => {
  const tabs: Array<{ key: SkillWorkspaceTab; label: string }> = [];

  if (canSubmit.value) {
    tabs.push({ key: "submit", label: "提交区" });
  }
  if (canViewSubmissions.value) {
    tabs.push({ key: "review", label: "审核区" });
  }
  if (canViewLibrary.value) {
    tabs.push({ key: "library", label: "发布库" });
  }
  if (canViewDownloadHistory.value) {
    tabs.push({ key: "downloads", label: "下载历史" });
  }

  return tabs;
});
const dashboardStats = computed(() => ({
  submissions: submissions.value.length,
  pendingReview: submissions.value.filter((row) => canReviewSkill(row.status, permissions.value)).length,
  published: libraryItems.value.length,
  pendingUpdate: downloadHistory.value.filter((item) => item.hasNewVersion).length,
}));

function resetMessages() {
  errorMessage.value = "";
  successMessage.value = "";
}

function resetRatingState() {
  ratingLoading.value = false;
  ratingSummary.value = null;
  myRating.value = null;
  ratingRows.value = [];
  ratingForm.rating = null;
  ratingForm.feedback = "";
}

function ensureVersionForm(skillId: string) {
  versionForms[skillId] ??= {
    versionLabel: "",
    packageFile: null,
    changelog: "",
  };

  return versionForms[skillId];
}

const ratingForm = reactive<SkillRatingFormState>({
  rating: null,
  feedback: "",
});

function resetForm() {
  form.name = "";
  form.summary = "";
  form.description = "";
  form.authorName = authStore.currentUser?.name ?? "";
  form.categoryId = categories.value[0]?.id ?? "";
  form.sourceType = "INTERNAL";
  form.sourceUrl = "";
  form.sourceLabel = "";
  form.visibility = "ALL_USERS";
  form.projectIds = [];
  form.visibleUserIds = [];
  form.packageFile = null;
  form.changelog = "";
}

function toggleSelection(list: string[], id: string, enabled: boolean) {
  if (enabled) {
    if (!list.includes(id)) {
      list.push(id);
    }
    return;
  }

  const index = list.indexOf(id);
  if (index >= 0) {
    list.splice(index, 1);
  }
}

function isSkillLibraryFiltersValue(value: unknown): value is SkillLibraryFilters {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<SkillLibraryFilters>;
  return (
    typeof candidate.keyword === "string" &&
    typeof candidate.categoryId === "string" &&
    typeof candidate.sourceType === "string"
  );
}

function persistLibraryFilters() {
  savePersistedFilters(
    SKILL_LIBRARY_FILTER_STORAGE_KEY,
    {
      keyword: libraryFilters.keyword,
      categoryId: libraryFilters.categoryId,
      sourceType: libraryFilters.sourceType,
    },
    (value) => !value.keyword.trim() && !value.categoryId.trim() && !value.sourceType.trim(),
  );
}

async function loadCategories() {
  categories.value = (await apiRequest<SkillCategoryOption[]>("/skills/options/categories")).filter(
    (item) => item.status === "ACTIVE",
  );

  if (!form.categoryId && categories.value.length > 0) {
    form.categoryId = categories.value[0].id;
  }
}

async function loadProjects() {
  projects.value = (await apiRequest<ProjectOption[]>("/skills/options/projects")).filter(
    (item) => item.status === "ACTIVE",
  );
}

async function loadUsers() {
  users.value = (await apiRequest<UserOption[]>("/skills/options/users")).filter(
    (item) => item.status === "ACTIVE",
  );
}

async function loadSubmissions() {
  if (!canViewSubmissions.value) {
    submissions.value = [];
    return;
  }

  submissions.value = await apiRequest<SkillListRow[]>("/skills/submissions");
  for (const row of submissions.value) {
    reviewComments[row.id] ??= "";
  }
}

async function loadDownloadHistory() {
  if (!canViewDownloadHistory.value) {
    downloadHistory.value = [];
    downloadRecords.value = [];
    return;
  }

  const [history, records] = await Promise.all([
    apiRequest<SkillDownloadHistoryRow[]>("/skills/downloads/history"),
    apiRequest<SkillDownloadRecordRow[]>("/skills/downloads/records"),
  ]);

  downloadHistory.value = history;
  downloadRecords.value = records;
}

async function loadLibrary() {
  if (!canViewLibrary.value) {
    libraryItems.value = [];
    return;
  }

  libraryItems.value = await apiRequest<SkillListRow[]>(
    `/skills/library${buildSkillLibraryQuery(libraryFilters)}`,
  );
  for (const row of libraryItems.value) {
    ensureVersionForm(row.id);
  }
}

async function loadRatingBoard(skillId: string) {
  if (!canViewRatings.value) {
    ratingLoading.value = false;
    ratingSummary.value = null;
    myRating.value = null;
    ratingRows.value = [];
    return;
  }

  ratingLoading.value = true;

  try {
    const [summary, currentRating, ratings] = await Promise.all([
      apiRequest<SkillRatingSummary>(`/skills/${skillId}/rating-summary`),
      apiRequest<SkillRatingDetail | null>(`/skills/${skillId}/rating/me`),
      apiRequest<SkillRatingDetail[]>(`/skills/${skillId}/ratings`),
    ]);

    ratingSummary.value = summary;
    myRating.value = currentRating;
    ratingRows.value = ratings;
    ratingForm.rating = currentRating?.rating ?? null;
    ratingForm.feedback = currentRating?.feedback ?? "";
  } catch (error) {
    ratingSummary.value = null;
    myRating.value = null;
    ratingRows.value = [];
    throw error;
  } finally {
    ratingLoading.value = false;
  }
}

async function loadVersions(skillId: string) {
  versionLoadingId.value = skillId;

  try {
    versionRows[skillId] = await apiRequest<SkillListRow[]>(`/skills/${skillId}/versions`);
  } finally {
    versionLoadingId.value = "";
  }
}

async function loadDetail(skillId: string) {
  detailLoadingId.value = skillId;
  resetMessages();
  resetRatingState();

  try {
    selectedDetail.value = await apiRequest<SkillDetailRow>(`/skills/library/${skillId}`);
    await loadRatingBoard(skillId);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Skill 详情加载失败";
  } finally {
    detailLoadingId.value = "";
  }
}

async function openSkillFromRoute(skillId: unknown) {
  if (!canViewLibrary.value || typeof skillId !== "string" || !skillId.trim()) {
    return;
  }

  workspaceTab.value = "library";
  if (selectedDetail.value?.id === skillId && !detailLoadingId.value) {
    return;
  }

  await loadDetail(skillId);
}

function selectSkillPackage(event: Event) {
  const input = event.target as HTMLInputElement;
  form.packageFile = input.files?.[0] ?? null;
}

function selectVersionPackage(skillId: string, event: Event) {
  const input = event.target as HTMLInputElement;
  ensureVersionForm(skillId).packageFile = input.files?.[0] ?? null;
}

function triggerBrowserDownload(blob: Blob, fileName: string) {
  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(downloadUrl);
}

async function downloadSkill(skillId: string, versionId?: string) {
  downloadSubmittingId.value = versionId ?? skillId;
  resetMessages();

  try {
    const query = versionId ? `?${new URLSearchParams({ versionId }).toString()}` : "";
    const response = await apiDownload(`/skills/${skillId}/download${query}`);
    const fileName = response.fileName ?? "skill-package.zip";

    triggerBrowserDownload(response.blob, fileName);

    successMessage.value = `${fileName} 下载已开始`;
    if (canViewDownloadHistory.value) {
      await loadDownloadHistory();
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Skill 下载失败";
  } finally {
    downloadSubmittingId.value = "";
  }
}

async function submitSkill() {
  if (!form.name || !form.summary || !form.description || !form.authorName || !form.categoryId) {
    errorMessage.value = "请先补全 Skill 基本信息";
    successMessage.value = "";
    return;
  }

  if (!form.packageFile || !form.changelog) {
    errorMessage.value = "请上传 Zip 包并填写版本更新说明";
    successMessage.value = "";
    return;
  }

  submitting.value = true;
  resetMessages();

  try {
    await apiRequest("/skills", {
      method: "POST",
      body: buildSkillFormData(form),
    });

    successMessage.value = "Skill 已提交，等待审核";
    resetForm();
    await Promise.all([loadSubmissions(), loadLibrary()]);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Skill 提交失败";
  } finally {
    submitting.value = false;
  }
}

async function reviewSkill(id: string, action: "APPROVE" | "REJECT") {
  reviewSubmittingId.value = id;
  resetMessages();

  try {
    await apiRequest(`/skills/${id}/review`, {
      method: "POST",
      body: JSON.stringify({
        action,
        comment: reviewComments[id] || undefined,
      }),
    });

    successMessage.value = action === "APPROVE" ? "Skill 已审核通过" : "Skill 已驳回";
    await Promise.all([loadSubmissions(), loadLibrary()]);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Skill 审核失败";
  } finally {
    reviewSubmittingId.value = "";
  }
}

async function publishSkill(id: string) {
  publishSubmittingId.value = id;
  resetMessages();

  try {
    await apiRequest(`/skills/${id}/publish`, {
      method: "POST",
    });

    successMessage.value = "Skill 已发布";
    await Promise.all([loadSubmissions(), loadLibrary()]);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Skill 发布失败";
  } finally {
    publishSubmittingId.value = "";
  }
}

async function submitSkillVersion(skill: SkillListRow) {
  const form = ensureVersionForm(skill.id);
  if (!form.versionLabel || !form.packageFile || !form.changelog) {
    errorMessage.value = "请填写版本号、上传 Zip 包并填写更新说明";
    successMessage.value = "";
    return;
  }

  versionSubmittingId.value = skill.id;
  resetMessages();

  try {
    await apiRequest(`/skills/${skill.id}/versions`, {
      method: "POST",
      body: buildSkillVersionFormData(form),
    });

    successMessage.value = "新版本已提交，等待审核";
    versionForms[skill.id] = {
      versionLabel: "",
      packageFile: null,
      changelog: "",
    };
    await Promise.all([loadSubmissions(), loadLibrary(), loadVersions(skill.id)]);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "版本提交失败";
  } finally {
    versionSubmittingId.value = "";
  }
}

async function submitRating() {
  if (!selectedDetail.value) {
    return;
  }

  if (ratingForm.rating === null || !ratingForm.feedback.trim()) {
    errorMessage.value = "请先选择评分并填写反馈内容";
    successMessage.value = "";
    return;
  }

  ratingSubmitting.value = true;
  resetMessages();

  const targetSkillId = selectedDetail.value.id;

  try {
    const result = await apiRequest<SkillRatingDetail>(`/skills/${targetSkillId}/rating`, {
      method: "POST",
      body: JSON.stringify({
        rating: ratingForm.rating,
        feedback: ratingForm.feedback,
      }),
    });

    myRating.value = result;
    ratingForm.rating = result.rating;
    ratingForm.feedback = result.feedback;
    successMessage.value = "评分反馈已提交";
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "评分反馈提交失败";
    ratingSubmitting.value = false;
    return;
  }

  if (canViewRatings.value) {
    try {
      await loadRatingBoard(targetSkillId);
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? `评分已保存，但刷新评分区失败：${error.message}` : "评分已保存，但刷新评分区失败";
    }
  }

  ratingSubmitting.value = false;
}

async function applyLibraryFilters() {
  selectedDetail.value = null;
  resetRatingState();
  resetMessages();
  persistLibraryFilters();

  try {
    await loadLibrary();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Skill 列表加载失败";
  }
}

onMounted(async () => {
  const persistedLibraryFilters = loadPersistedFilters(
    SKILL_LIBRARY_FILTER_STORAGE_KEY,
    {
      keyword: "",
      categoryId: "",
      sourceType: "",
    },
    isSkillLibraryFiltersValue,
  );
  libraryFilters.keyword = persistedLibraryFilters.keyword;
  libraryFilters.categoryId = persistedLibraryFilters.categoryId;
  libraryFilters.sourceType = persistedLibraryFilters.sourceType;
  loading.value = true;
  resetMessages();

  try {
    const loaders: Array<Promise<unknown>> = [loadCategories(), loadSubmissions(), loadLibrary(), loadDownloadHistory()];
    if (canSubmit.value) {
      loaders.push(loadProjects(), loadUsers());
    }

    await Promise.all(loaders);
    resetForm();
    await openSkillFromRoute(route.query.skillId);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Skill 页面数据加载失败";
  } finally {
    loading.value = false;
  }
});

watch(
  () => route.query.skillId,
  async (skillId) => {
    if (loading.value) {
      return;
    }

    await openSkillFromRoute(skillId);
  },
);

watch(workspaceTabs, (tabs) => {
  if (tabs.length === 0) {
    return;
  }

  if (!tabs.some((tab) => tab.key === workspaceTab.value)) {
    workspaceTab.value = tabs[0].key;
  }
});
</script>

<template>
  <section class="admin-page">
    <header class="page-header">
      <div>
        <h2>Skill 管理工作台</h2>
        <p>按提交、审核、发布和下载四个工作区拆分，避免所有功能挤在同一页面。</p>
      </div>
    </header>

    <article class="admin-card skill-dashboard-card">
      <div class="admin-stat-grid">
        <div class="admin-stat-card">
          <strong class="admin-stat-label">提交记录</strong>
          <div class="admin-stat-value">{{ dashboardStats.submissions }}</div>
        </div>
        <div class="admin-stat-card">
          <strong class="admin-stat-label">待审核</strong>
          <div class="admin-stat-value">{{ dashboardStats.pendingReview }}</div>
        </div>
        <div class="admin-stat-card">
          <strong class="admin-stat-label">发布库</strong>
          <div class="admin-stat-value">{{ dashboardStats.published }}</div>
        </div>
        <div class="admin-stat-card">
          <strong class="admin-stat-label">待更新提醒</strong>
          <div class="admin-stat-value">{{ dashboardStats.pendingUpdate }}</div>
        </div>
      </div>

      <div class="skill-workspace-tabs">
        <button
          v-for="tab in workspaceTabs"
          :key="tab.key"
          class="admin-button"
          :class="workspaceTab === tab.key ? 'admin-button-primary' : 'admin-button-secondary'"
          @click="workspaceTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </article>

    <article v-if="canSubmit && workspaceTab === 'submit'" class="admin-card">
      <h3>提交 Skill</h3>
      <div class="admin-form-grid">
        <div class="admin-field">
          <label for="skill-name">Skill 名称</label>
          <input id="skill-name" v-model.trim="form.name" placeholder="例如 智能周报助手" />
        </div>
        <div class="admin-field">
          <label for="skill-author">作者</label>
          <input id="skill-author" v-model.trim="form.authorName" placeholder="作者名称" />
        </div>
        <div class="admin-field">
          <label for="skill-summary">简介</label>
          <input id="skill-summary" v-model.trim="form.summary" placeholder="一句话说明用途" />
        </div>
        <div class="admin-field">
          <label for="skill-category">分类</label>
          <select id="skill-category" v-model="form.categoryId">
            <option value="">请选择分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="admin-field">
          <label for="skill-source-type">来源类型</label>
          <select id="skill-source-type" v-model="form.sourceType">
            <option value="INTERNAL">内部自研</option>
            <option value="EXTERNAL">外部平台</option>
          </select>
        </div>
        <div class="admin-field">
          <label for="skill-visibility">可见范围</label>
          <select id="skill-visibility" v-model="form.visibility">
            <option value="ALL_USERS">全部可见</option>
            <option value="PROJECT_MEMBERS">按项目成员可见</option>
            <option value="SPECIFIED_USERS">指定账号可见</option>
          </select>
        </div>
        <div v-if="form.sourceType === 'EXTERNAL'" class="admin-field">
          <label for="skill-source-url">来源网址</label>
          <input id="skill-source-url" v-model.trim="form.sourceUrl" placeholder="https://example.com" />
        </div>
        <div v-if="form.sourceType === 'EXTERNAL'" class="admin-field">
          <label for="skill-source-label">来源网址名称</label>
          <input id="skill-source-label" v-model.trim="form.sourceLabel" placeholder="例如 clawhub.ai" />
        </div>
        <div class="admin-field">
          <label for="skill-package-file">Zip 包上传</label>
          <input id="skill-package-file" accept=".zip,application/zip" type="file" @change="selectSkillPackage" />
          <small v-if="form.packageFile" class="admin-muted">
            已选择：{{ form.packageFile.name }}（{{ formatPackageSize(form.packageFile.size) }}）
          </small>
        </div>
        <div class="admin-field admin-field-wide">
          <label for="skill-description">详细说明</label>
          <textarea id="skill-description" v-model.trim="form.description" placeholder="补充使用说明、适用场景和注意事项" />
        </div>
        <div class="admin-field admin-field-wide">
          <label for="skill-changelog">版本更新说明</label>
          <textarea id="skill-changelog" v-model.trim="form.changelog" placeholder="说明当前版本新增内容或变更点" />
        </div>
      </div>

      <div v-if="form.visibility === 'PROJECT_MEMBERS'" class="admin-card admin-mt-16">
        <strong>可见项目</strong>
        <div class="admin-tag-list admin-mt-12">
          <label v-for="project in projects" :key="project.id" class="admin-tag">
            <input
              :checked="form.projectIds.includes(project.id)"
              type="checkbox"
              @change="toggleSelection(form.projectIds, project.id, ($event.target as HTMLInputElement).checked)"
            />
            {{ project.name }}
          </label>
        </div>
      </div>

      <div v-if="form.visibility === 'SPECIFIED_USERS'" class="admin-card admin-mt-16">
        <strong>指定可见账号</strong>
        <div class="admin-tag-list admin-mt-12">
          <label v-for="user in users" :key="user.id" class="admin-tag">
            <input
              :checked="form.visibleUserIds.includes(user.id)"
              type="checkbox"
              @change="
                toggleSelection(form.visibleUserIds, user.id, ($event.target as HTMLInputElement).checked)
              "
            />
            {{ user.name }} / {{ user.account }}
          </label>
        </div>
      </div>

      <div class="admin-actions">
        <button class="admin-button admin-button-primary" :disabled="submitting" @click="submitSkill">
          {{ submitting ? "提交中..." : "提交 Skill" }}
        </button>
        <button class="admin-button admin-button-secondary" :disabled="submitting" @click="resetForm">
          重置
        </button>
      </div>
    </article>

    <p v-if="errorMessage" class="admin-message admin-message-error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="admin-message admin-message-success">{{ successMessage }}</p>

    <article v-if="canViewSubmissions && workspaceTab === 'review'" class="admin-card">
      <h3>提交记录</h3>
      <p v-if="loading" class="admin-empty">正在加载提交记录...</p>
      <p v-else-if="submissions.length === 0" class="admin-empty">当前还没有 Skill 提交记录。</p>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>分类</th>
            <th>可见范围</th>
            <th>状态</th>
            <th>提交人</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in submissions" :key="row.id">
            <td>
              <strong>{{ row.name }}</strong>
              <div class="admin-muted">{{ row.summary }}</div>
              <div class="admin-muted">版本 {{ row.versionLabel }}</div>
            </td>
            <td>{{ row.category.name }}</td>
            <td>{{ row.visibility }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.submitter.name }}</td>
            <td>
              <div class="admin-inline-grid">
                <textarea
                  v-if="canReviewSkill(row.status, permissions)"
                  v-model.trim="reviewComments[row.id]"
                  placeholder="审核意见（驳回时必填）"
                />
                <div class="admin-table-actions">
                  <button
                    v-if="canReviewSkill(row.status, permissions)"
                    class="admin-button admin-button-primary"
                    :disabled="reviewSubmittingId === row.id"
                    @click="reviewSkill(row.id, 'APPROVE')"
                  >
                    {{ reviewSubmittingId === row.id ? "处理中..." : "审核通过" }}
                  </button>
                  <button
                    v-if="canReviewSkill(row.status, permissions)"
                    class="admin-button admin-button-danger"
                    :disabled="reviewSubmittingId === row.id"
                    @click="reviewSkill(row.id, 'REJECT')"
                  >
                    {{ reviewSubmittingId === row.id ? "处理中..." : "驳回" }}
                  </button>
                  <button
                    v-if="canPublishSkill(row.status, permissions)"
                    class="admin-button admin-button-secondary"
                    :disabled="publishSubmittingId === row.id"
                    @click="publishSkill(row.id)"
                  >
                    {{ publishSubmittingId === row.id ? "发布中..." : "发布" }}
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </article>

    <article v-if="canViewLibrary && workspaceTab === 'library'" class="admin-card">
      <h3>已发布 Skill</h3>
      <div class="admin-form-grid" style="margin-bottom: 12px">
        <div class="admin-field">
          <label>关键词</label>
          <input v-model.trim="libraryFilters.keyword" placeholder="搜索名称、简介、详细说明" />
        </div>
        <div class="admin-field">
          <label>分类</label>
          <select v-model="libraryFilters.categoryId">
            <option value="">全部分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="admin-field">
          <label>来源</label>
          <select v-model="libraryFilters.sourceType">
            <option value="">全部来源</option>
            <option value="INTERNAL">内部自研</option>
            <option value="EXTERNAL">外部平台</option>
          </select>
        </div>
      </div>
      <div class="admin-actions">
        <button class="admin-button admin-button-primary" @click="applyLibraryFilters">查询</button>
        <button
          class="admin-button admin-button-secondary"
          @click="
            libraryFilters.keyword = '';
            libraryFilters.categoryId = '';
            libraryFilters.sourceType = '';
            applyLibraryFilters();
          "
        >
          重置
        </button>
      </div>
      <p v-if="loading" class="admin-empty">正在加载已发布 Skill...</p>
      <p v-else-if="libraryItems.length === 0" class="admin-empty">当前还没有已发布 Skill。</p>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>分类</th>
            <th>来源</th>
            <th>可见范围</th>
            <th>项目</th>
            <th>发布时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in libraryItems" :key="row.id">
            <td>
              <strong>{{ row.name }}</strong>
              <div class="admin-muted">{{ row.summary }}</div>
              <div class="admin-muted">当前版本 {{ row.versionLabel }}</div>
            </td>
            <td>{{ row.category.name }}</td>
            <td>{{ row.sourceType === "EXTERNAL" ? row.sourceLabel || "外部平台" : "内部自研" }}</td>
            <td>{{ row.visibility }}</td>
            <td>
              <div class="admin-tag-list">
                <span v-for="project in row.projects" :key="project.id" class="admin-tag">{{ project.name }}</span>
                <span v-if="row.projects.length === 0">-</span>
              </div>
            </td>
            <td>{{ row.publishedAt ? new Date(row.publishedAt).toLocaleString() : "-" }}</td>
          </tr>
          <tr v-for="row in libraryItems" :key="`${row.id}-versions`">
            <td colspan="6" class="admin-table-subrow">
              <div class="admin-inline-grid">
                <div class="admin-card">
                  <div class="admin-table-actions" style="justify-content: space-between; align-items: center">
                    <strong>版本历史</strong>
                    <div class="admin-table-actions">
                      <button
                        class="admin-button admin-button-secondary"
                        :disabled="detailLoadingId === row.id"
                        @click="loadDetail(row.id)"
                      >
                        {{ detailLoadingId === row.id ? "加载中..." : "查看详情" }}
                      </button>
                      <button
                        class="admin-button admin-button-secondary"
                        :disabled="versionLoadingId === row.id"
                        @click="loadVersions(row.id)"
                      >
                        {{ versionLoadingId === row.id ? "加载中..." : "刷新版本" }}
                      </button>
                    </div>
                  </div>
                  <p v-if="!versionRows[row.id]?.length" class="admin-empty">点击刷新后查看该 Skill 的版本历史。</p>
                  <div v-else class="admin-tag-list admin-mt-12">
                    <div v-for="version in versionRows[row.id]" :key="version.id" class="admin-card">
                      <strong>{{ version.versionLabel }}</strong>
                      <div class="admin-muted" style="margin-top: 6px">{{ version.status }}</div>
                      <div v-if="canDownload && version.status === 'PUBLISHED'" class="admin-actions admin-mt-12">
                        <button
                          class="admin-button admin-button-secondary"
                          :disabled="downloadSubmittingId === version.id"
                          @click="downloadSkill(row.id, version.id)"
                        >
                          {{ downloadSubmittingId === version.id ? "下载中..." : "下载版本" }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="
                    canSubmitSkillVersion(
                      row.status,
                      row.submitter.id,
                      authStore.currentUser?.id ?? '',
                      permissions,
                    )
                  "
                  class="admin-card"
                >
                  <strong>提交新版本</strong>
                  <div class="admin-form-grid admin-mt-12">
                    <div class="admin-field">
                      <label>版本号</label>
                      <input v-model.trim="ensureVersionForm(row.id).versionLabel" placeholder="例如 1.1.0" />
                    </div>
                    <div class="admin-field">
                      <label>Zip 包上传</label>
                      <input
                        accept=".zip,application/zip"
                        type="file"
                        @change="selectVersionPackage(row.id, $event)"
                      />
                      <small v-if="ensureVersionForm(row.id).packageFile" class="admin-muted">
                        已选择：{{ ensureVersionForm(row.id).packageFile?.name }}
                        （{{ formatPackageSize(ensureVersionForm(row.id).packageFile?.size ?? 0) }}）
                      </small>
                    </div>
                    <div class="admin-field admin-field-wide">
                      <label>更新说明</label>
                      <textarea v-model.trim="ensureVersionForm(row.id).changelog" />
                    </div>
                  </div>

                  <div class="admin-actions">
                    <button
                      class="admin-button admin-button-primary"
                      :disabled="versionSubmittingId === row.id"
                      @click="submitSkillVersion(row)"
                    >
                      {{ versionSubmittingId === row.id ? "提交中..." : "提交新版本" }}
                    </button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </article>

    <article v-if="selectedDetail && workspaceTab === 'library'" class="admin-card">
      <div class="admin-table-actions" style="justify-content: space-between; margin-bottom: 12px; align-items: center">
        <h3>Skill 详情</h3>
        <button
          v-if="canDownload"
          class="admin-button admin-button-secondary"
          :disabled="downloadSubmittingId === selectedDetail.id"
          @click="downloadSkill(selectedDetail.id)"
        >
          {{ downloadSubmittingId === selectedDetail.id ? "下载中..." : "下载当前版本" }}
        </button>
      </div>
      <div class="admin-form-grid">
        <div class="admin-field">
          <label>名称</label>
          <input :value="selectedDetail.name" disabled />
        </div>
        <div class="admin-field">
          <label>当前版本</label>
          <input :value="selectedDetail.versionLabel" disabled />
        </div>
        <div class="admin-field">
          <label>Zip 文件</label>
          <input
            :value="`${selectedDetail.packageOriginalName || selectedDetail.packageName}（${formatPackageSize(selectedDetail.packageSizeBytes)}）`"
            disabled
          />
        </div>
        <div class="admin-field">
          <label>分类</label>
          <input :value="selectedDetail.category.name" disabled />
        </div>
        <div class="admin-field">
          <label>来源</label>
          <input
            :value="
              selectedDetail.sourceType === 'EXTERNAL'
                ? `${selectedDetail.sourceLabel || '外部平台'} ${selectedDetail.sourceUrl || ''}`.trim()
                : '内部自研'
            "
            disabled
          />
        </div>
        <div class="admin-field">
          <label>作者</label>
          <input :value="selectedDetail.authorName" disabled />
        </div>
        <div class="admin-field">
          <label>可见范围</label>
          <input :value="selectedDetail.visibility" disabled />
        </div>
        <div class="admin-field admin-field-wide">
          <label>简介</label>
          <textarea :value="selectedDetail.summary" disabled />
        </div>
        <div class="admin-field admin-field-wide">
          <label>详细说明</label>
          <textarea :value="selectedDetail.description" disabled />
        </div>
        <div class="admin-field admin-field-wide">
          <label>版本更新说明</label>
          <textarea :value="selectedDetail.changelog" disabled />
        </div>
      </div>

      <div v-if="showRatingSection" class="admin-inline-grid admin-mt-16">
        <div class="admin-card">
          <strong>评分概览</strong>
          <p v-if="!canViewRatings" class="admin-empty admin-mt-12">
            你当前可以评分，但还没有查看评分概览的权限。
          </p>
          <template v-else>
            <p v-if="ratingLoading" class="admin-empty admin-mt-12">正在加载评分概览...</p>
            <template v-else-if="ratingSummary">
              <div class="admin-inline-grid admin-mt-12">
                <div class="admin-card admin-card-soft" style="margin: 0; padding: 12px">
                  <strong>{{ formatRatingAverage(ratingSummary.averageRating, ratingSummary.totalRatings) }}</strong>
                  <div class="admin-muted" style="margin-top: 6px">平均分</div>
                </div>
                <div class="admin-card admin-card-soft" style="margin: 0; padding: 12px">
                  <strong>{{ ratingSummary.totalRatings }}</strong>
                  <div class="admin-muted" style="margin-top: 6px">评分人数</div>
                </div>
              </div>
              <div class="admin-mt-16">
                <div v-for="row in ratingDistributionRows" :key="row.rating" class="admin-mt-10">
                  <div class="admin-table-actions" style="justify-content: space-between">
                    <strong>{{ row.label }}</strong>
                    <span>{{ row.count }} 条{{ ratingSummary.totalRatings > 0 ? ` · ${row.percent}%` : "" }}</span>
                  </div>
                  <div class="admin-rating-track">
                    <div
                      :style="{
                        width: `${row.percent}%`,
                        height: '100%',
                        background:
                          row.rating >= 4
                            ? 'var(--yb-chart-positive)'
                            : row.rating === 3
                              ? 'var(--yb-chart-medium)'
                              : 'var(--yb-chart-negative)',
                      }"
                    />
                  </div>
                </div>
              </div>
            </template>
            <p v-else class="admin-empty admin-mt-12">当前还没有评分数据。</p>
          </template>
        </div>

        <div v-if="canRate" class="admin-card">
          <strong>我的评分反馈</strong>
          <p class="admin-empty admin-mt-12">下载后可评分，提交后可继续修改。</p>
          <div class="admin-form-grid admin-mt-12">
            <div class="admin-field">
              <label>评分</label>
              <select v-model="ratingForm.rating">
                <option :value="null">请选择评分</option>
                <option v-for="level in ratingLevels" :key="level" :value="level">{{ level }} 分</option>
              </select>
            </div>
            <div class="admin-field admin-field-wide">
              <label>反馈内容</label>
              <textarea v-model.trim="ratingForm.feedback" placeholder="写下你对这个 Skill 的真实体验和建议" />
            </div>
          </div>
          <div class="admin-actions">
            <button
              class="admin-button admin-button-primary"
              :disabled="ratingSubmitting"
              @click="submitRating"
            >
              {{ ratingSubmitting ? "提交中..." : myRating ? "更新评分" : "提交评分" }}
            </button>
          </div>
          <p v-if="myRating" class="admin-empty admin-mt-12">
            当前评分 {{ myRating.rating }} 分，更新于 {{ new Date(myRating.updatedAt).toLocaleString() }}
          </p>
        </div>
      </div>

      <div class="admin-inline-grid admin-mt-16">
        <div class="admin-card">
          <strong>关联项目</strong>
          <div class="admin-tag-list admin-mt-12">
            <span v-for="project in selectedDetail.projects" :key="project.id" class="admin-tag">
              {{ project.name }}
            </span>
            <span v-if="selectedDetail.projects.length === 0">-</span>
          </div>
        </div>

        <div class="admin-card">
          <strong>版本列表</strong>
          <div class="admin-tag-list admin-mt-12">
            <div v-for="version in selectedDetail.versions" :key="version.id" class="admin-card">
              <strong>{{ version.versionLabel }}</strong>
              <div class="admin-muted" style="margin-top: 6px">{{ version.status }}</div>
              <div v-if="canDownload" class="admin-actions admin-mt-12">
                <button
                  class="admin-button admin-button-secondary"
                  :disabled="downloadSubmittingId === version.id"
                  @click="downloadSkill(selectedDetail.id, version.id)"
                >
                  {{ downloadSubmittingId === version.id ? "下载中..." : "下载版本" }}
                </button>
              </div>
            </div>
            <span v-if="selectedDetail.versions.length === 0">-</span>
          </div>
        </div>
      </div>

      <div v-if="canViewRatings" class="admin-card admin-mt-16">
        <strong>员工反馈列表</strong>
        <p v-if="ratingLoading" class="admin-empty admin-mt-12">正在加载员工反馈...</p>
        <p v-else-if="ratingRows.length === 0" class="admin-empty admin-mt-12">当前还没有员工反馈。</p>
        <table v-else class="admin-table admin-mt-12">
          <thead>
            <tr>
              <th>姓名 / 部门</th>
              <th>评分</th>
              <th>反馈</th>
              <th>更新时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in ratingRows" :key="row.id">
              <td>
                <strong>{{ row.rater.name }}</strong>
                <div class="admin-muted">{{ row.rater.departmentName || "-" }}</div>
              </td>
              <td>{{ row.rating }} 分</td>
              <td class="admin-prewrap">{{ row.feedback }}</td>
              <td>{{ new Date(row.updatedAt).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <article v-if="canViewDownloadHistory && workspaceTab === 'downloads'" class="admin-card">
      <h3>历史下载 Skill</h3>
      <p v-if="downloadHistory.length === 0" class="admin-empty">当前还没有历史下载记录。</p>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>Skill</th>
            <th>作者</th>
            <th>分类</th>
            <th>上次下载版本</th>
            <th>当前最新版本</th>
            <th>状态</th>
            <th>最近下载时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in downloadHistory" :key="row.seriesId">
            <td>{{ row.skillName }}</td>
            <td>{{ row.authorName }}</td>
            <td>{{ row.category.name }}</td>
            <td>{{ row.lastDownloadedVersion }}</td>
            <td>{{ row.latestPublishedVersion }}</td>
            <td>
              <span :class="row.hasNewVersion ? 'admin-tag' : ''">
                {{ row.hasNewVersion ? "有新版本" : "已是最新" }}
              </span>
            </td>
            <td>{{ new Date(row.downloadedAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </article>

    <article v-if="canViewDownloadHistory && workspaceTab === 'downloads'" class="admin-card">
      <h3>下载记录详情</h3>
      <p v-if="downloadRecords.length === 0" class="admin-empty">当前还没有下载明细。</p>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>Skill</th>
            <th>版本</th>
            <th>部门</th>
            <th>下载时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in downloadRecords" :key="row.id">
            <td>{{ row.skillName }}</td>
            <td>{{ row.versionLabel }}</td>
            <td>{{ row.departmentName }}</td>
            <td>{{ new Date(row.downloadedAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>

<style scoped>
.skill-dashboard-card {
  display: grid;
  gap: 14px;
}

.skill-workspace-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
