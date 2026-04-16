<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { apiRequest } from "../../api/client";
import { useAuthStore } from "../../stores/auth";
import {
  buildProjectEditDraft,
  buildProjectUpdatePayload,
  listAvailableProjectMembers,
  type EditableProjectRow,
  type MemberCandidate,
  type ProjectEditDraft,
  type ProjectMemberRow,
} from "./project-page.helpers";

interface ProjectRow extends EditableProjectRow {
  members: ProjectMemberRow[];
}

const authStore = useAuthStore();
const rows = ref<ProjectRow[]>([]);
const memberCandidates = ref<MemberCandidate[]>([]);
const loading = ref(false);
const submitting = ref(false);
const memberSubmittingId = ref("");
const memberRemovingKey = ref("");
const deletingId = ref("");
const selectedProjectId = ref("");
const createModalOpen = ref(false);
const selectedMemberId = ref("");
const errorMessage = ref("");
const successMessage = ref("");

const filters = reactive({
  keyword: "",
  status: "ALL",
  hasMembers: "ALL",
});

const createForm = reactive({
  name: "",
  description: "",
});

const editDraft = reactive<ProjectEditDraft>({
  name: "",
  description: "",
});

const canCreate = computed(() => authStore.currentUser?.permissions.includes("project.create") ?? false);
const canEdit = computed(() => authStore.currentUser?.permissions.includes("project.edit") ?? false);
const canDelete = computed(() => authStore.currentUser?.permissions.includes("project.delete") ?? false);
const canAddMembers = computed(
  () =>
    (authStore.currentUser?.permissions.includes("project.member.add") ?? false) &&
    (authStore.currentUser?.permissions.includes("user.view") ?? false),
);
const canRemoveMembers = computed(
  () => authStore.currentUser?.permissions.includes("project.member.remove") ?? false,
);
const selectedProject = computed(() => rows.value.find((row) => row.id === selectedProjectId.value) ?? null);

const filteredRows = computed(() =>
  rows.value.filter((row) => {
    if (filters.keyword) {
      const keyword = filters.keyword.trim().toLowerCase();
      const description = row.description?.toLowerCase() ?? "";
      if (!row.name.toLowerCase().includes(keyword) && !description.includes(keyword)) {
        return false;
      }
    }

    if (filters.status !== "ALL" && row.status !== filters.status) {
      return false;
    }

    if (filters.hasMembers === "YES" && row.members.length === 0) {
      return false;
    }

    if (filters.hasMembers === "NO" && row.members.length > 0) {
      return false;
    }

    return true;
  }),
);

const stats = computed(() => ({
  total: rows.value.length,
  active: rows.value.filter((row) => row.status === "ACTIVE").length,
  disabled: rows.value.filter((row) => row.status === "DISABLED").length,
  shown: filteredRows.value.length,
}));

const availableMembersForSelected = computed(() => {
  if (!selectedProject.value) {
    return [];
  }
  return listAvailableProjectMembers(memberCandidates.value, selectedProject.value.members);
});

function resetMessages() {
  errorMessage.value = "";
  successMessage.value = "";
}

function resetCreateForm() {
  createForm.name = "";
  createForm.description = "";
}

function resetFilters() {
  filters.keyword = "";
  filters.status = "ALL";
  filters.hasMembers = "ALL";
}

function formatStatusLabel(status: string) {
  return status === "ACTIVE" ? "启用" : "停用";
}

function syncSelectedMemberCandidate() {
  selectedMemberId.value = availableMembersForSelected.value[0]?.id ?? "";
}

function syncEditDraftFromSelected() {
  if (!selectedProject.value || !canEdit.value) {
    return;
  }
  Object.assign(editDraft, buildProjectEditDraft(selectedProject.value));
}

async function loadProjects() {
  const previousSelectedId = selectedProjectId.value;
  rows.value = await apiRequest<ProjectRow[]>("/projects");

  if (rows.value.some((item) => item.id === previousSelectedId)) {
    selectedProjectId.value = previousSelectedId;
  } else {
    selectedProjectId.value = rows.value[0]?.id ?? "";
  }
}

async function loadMemberCandidates() {
  if (!canAddMembers.value) {
    memberCandidates.value = [];
    selectedMemberId.value = "";
    return;
  }

  const users = await apiRequest<Array<{ id: string; account: string; name: string; status: string }>>("/users");
  memberCandidates.value = users.map((user) => ({
    id: user.id,
    account: user.account,
    name: user.name,
    status: user.status,
  }));
  syncSelectedMemberCandidate();
}

function openCreateModal() {
  if (!canCreate.value) {
    return;
  }
  createModalOpen.value = true;
  resetMessages();
  resetCreateForm();
}

function closeCreateModal() {
  createModalOpen.value = false;
}

function setBodyModalLock(locked: boolean) {
  if (typeof document === "undefined") {
    return;
  }
  document.body.style.overflow = locked ? "hidden" : "";
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === "Escape" && createModalOpen.value) {
    closeCreateModal();
  }
}

function openDetailDrawer(projectId: string) {
  selectedProjectId.value = projectId;
  resetMessages();
}

async function submitCreateProject() {
  if (!createForm.name) {
    errorMessage.value = "请填写项目名称";
    successMessage.value = "";
    return;
  }

  const createdName = createForm.name;
  submitting.value = true;
  resetMessages();

  try {
    await apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify({
        name: createForm.name,
        description: createForm.description || undefined,
      }),
    });

    successMessage.value = "项目已创建";
    resetCreateForm();
    await loadProjects();
    closeCreateModal();
    const created = rows.value.find((row) => row.name === createdName);
    if (created) {
      openDetailDrawer(created.id);
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "项目创建失败";
  } finally {
    submitting.value = false;
  }
}

async function submitEditProject() {
  if (!selectedProject.value) {
    return;
  }

  const payload = buildProjectUpdatePayload(selectedProject.value, editDraft);
  if (!payload) {
    successMessage.value = "没有可保存的变更";
    errorMessage.value = "";
    return;
  }

  submitting.value = true;
  resetMessages();

  try {
    await apiRequest(`/projects/${selectedProject.value.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    successMessage.value = "项目已更新";
    await loadProjects();
    syncEditDraftFromSelected();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "项目更新失败";
  } finally {
    submitting.value = false;
  }
}

async function removeProject() {
  if (!selectedProject.value) {
    return;
  }

  const confirmed = window.confirm("确认删除该项目吗？此操作不可撤销。");
  if (!confirmed) {
    return;
  }

  deletingId.value = selectedProject.value.id;
  resetMessages();

  try {
    await apiRequest(`/projects/${selectedProject.value.id}`, {
      method: "DELETE",
    });

    successMessage.value = "项目已删除";
    await loadProjects();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "项目删除失败";
  } finally {
    deletingId.value = "";
  }
}

async function addMember() {
  if (!selectedProject.value) {
    return;
  }

  if (!selectedMemberId.value) {
    errorMessage.value = "请先选择要添加的成员";
    successMessage.value = "";
    return;
  }

  memberSubmittingId.value = selectedProject.value.id;
  resetMessages();

  try {
    await apiRequest(`/projects/${selectedProject.value.id}/members`, {
      method: "POST",
      body: JSON.stringify({ userIds: [selectedMemberId.value] }),
    });

    successMessage.value = "项目成员已添加";
    await loadProjects();
    syncSelectedMemberCandidate();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "成员添加失败";
  } finally {
    memberSubmittingId.value = "";
  }
}

async function removeMember(userId: string) {
  if (!selectedProject.value) {
    return;
  }

  memberRemovingKey.value = `${selectedProject.value.id}:${userId}`;
  resetMessages();

  try {
    await apiRequest(`/projects/${selectedProject.value.id}/members/${userId}`, {
      method: "DELETE",
    });

    successMessage.value = "项目成员已移除";
    await loadProjects();
    syncSelectedMemberCandidate();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "成员移除失败";
  } finally {
    memberRemovingKey.value = "";
  }
}

watch(selectedProject, () => {
  syncEditDraftFromSelected();
  syncSelectedMemberCandidate();
});

watch(filteredRows, (nextRows) => {
  if (nextRows.length === 0) {
    selectedProjectId.value = "";
    return;
  }
  if (!nextRows.some((row) => row.id === selectedProjectId.value)) {
    selectedProjectId.value = nextRows[0].id;
  }
});

watch(createModalOpen, (open) => {
  setBodyModalLock(open);
});

onMounted(async () => {
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleEscape);
  }
  loading.value = true;
  resetMessages();

  try {
    await Promise.all([loadProjects(), loadMemberCandidates()]);
    syncEditDraftFromSelected();
    syncSelectedMemberCandidate();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "项目数据加载失败";
    rows.value = [];
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  setBodyModalLock(false);
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", handleEscape);
  }
});
</script>

<template>
  <section class="admin-page project-page-modern">
    <header class="page-header">
      <div>
        <h2>项目管理</h2>
        <p>统一在单页工作区维护项目信息与成员关系，创建操作采用弹窗，主界面更聚焦。</p>
      </div>
    </header>

    <article class="admin-card project-filterbar">
      <div class="project-stat-grid">
        <div class="project-stat">
          <span>项目总数</span>
          <strong>{{ stats.total }}</strong>
        </div>
        <div class="project-stat">
          <span>启用项目</span>
          <strong>{{ stats.active }}</strong>
        </div>
        <div class="project-stat">
          <span>停用项目</span>
          <strong>{{ stats.disabled }}</strong>
        </div>
        <div class="project-stat">
          <span>当前筛选</span>
          <strong>{{ stats.shown }}</strong>
        </div>
      </div>

      <div class="admin-form-grid">
        <div class="admin-field">
          <label>关键词</label>
          <input v-model.trim="filters.keyword" placeholder="搜索项目名称或描述" />
        </div>
        <div class="admin-field">
          <label>状态</label>
          <select v-model="filters.status">
            <option value="ALL">全部状态</option>
            <option value="ACTIVE">启用</option>
            <option value="DISABLED">停用</option>
          </select>
        </div>
        <div class="admin-field">
          <label>成员情况</label>
          <select v-model="filters.hasMembers">
            <option value="ALL">全部</option>
            <option value="YES">有成员</option>
            <option value="NO">无成员</option>
          </select>
        </div>
      </div>

      <div class="admin-actions">
        <button class="admin-button admin-button-secondary" @click="resetFilters">重置筛选</button>
        <button v-if="canCreate" class="admin-button admin-button-primary" @click="openCreateModal">
          新建项目
        </button>
      </div>
    </article>

    <p v-if="errorMessage" class="admin-message admin-message-error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="admin-message admin-message-success">{{ successMessage }}</p>

    <div class="project-workspace">
      <article class="admin-card project-list-panel">
        <h3>项目列表</h3>
        <p v-if="loading" class="admin-empty admin-mt-12">正在加载项目数据...</p>
        <p v-else-if="filteredRows.length === 0" class="admin-empty admin-mt-12">当前筛选条件下没有项目。</p>
        <table v-else class="admin-table admin-mt-12">
          <thead>
            <tr>
              <th>项目名称</th>
              <th>描述</th>
              <th>成员数</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in filteredRows"
              :key="row.id"
              :class="{ 'project-row-active': row.id === selectedProjectId }"
            >
              <td>{{ row.name }}</td>
              <td>{{ row.description || "-" }}</td>
              <td>{{ row.members.length }}</td>
              <td>
                <span
                  class="admin-tag"
                  :class="row.status === 'ACTIVE' ? 'admin-tag-success' : 'admin-tag-danger'"
                >
                  {{ formatStatusLabel(row.status) }}
                </span>
              </td>
              <td>
                <button class="admin-button admin-button-secondary" @click="openDetailDrawer(row.id)">
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </article>

      <aside class="admin-card project-detail-drawer">
        <div class="project-drawer-head">
          <h3>{{ selectedProject?.name || "项目详情" }}</h3>
          <p v-if="selectedProject" class="admin-empty">{{ formatStatusLabel(selectedProject.status) }}</p>
        </div>

        <template v-if="selectedProject">
          <div class="admin-form-grid">
            <div class="admin-field">
              <label>项目名称</label>
              <input v-model.trim="editDraft.name" :disabled="!canEdit" />
            </div>
            <div class="admin-field admin-field-wide">
              <label>项目说明</label>
              <textarea
                v-model.trim="editDraft.description"
                :disabled="!canEdit"
                placeholder="可选，补充项目背景或使用范围"
              />
            </div>
          </div>

          <div class="admin-actions">
            <button
              v-if="canEdit"
              class="admin-button admin-button-primary"
              :disabled="submitting"
              @click="submitEditProject"
            >
              {{ submitting ? "保存中..." : "保存变更" }}
            </button>
            <button
              v-if="canDelete"
              class="admin-button admin-button-danger"
              :disabled="deletingId === selectedProject.id"
              @click="removeProject"
            >
              {{ deletingId === selectedProject.id ? "删除中..." : "删除项目" }}
            </button>
          </div>

          <div class="admin-card admin-mt-12">
            <div class="project-member-head">
              <strong>项目成员</strong>
              <span class="admin-empty">共 {{ selectedProject.members.length }} 人</span>
            </div>

            <div class="admin-tag-list admin-mt-12">
              <span v-for="member in selectedProject.members" :key="member.userId" class="admin-tag">
                {{ member.name }} / {{ member.account }}
              </span>
              <span v-if="selectedProject.members.length === 0" class="admin-empty">暂无成员</span>
            </div>

            <div v-if="canAddMembers" class="admin-actions admin-mt-12">
              <select v-model="selectedMemberId">
                <option value="">请选择成员</option>
                <option v-for="candidate in availableMembersForSelected" :key="candidate.id" :value="candidate.id">
                  {{ candidate.name }} / {{ candidate.account }}
                </option>
              </select>
              <button
                class="admin-button admin-button-primary"
                :disabled="memberSubmittingId === selectedProject.id"
                @click="addMember"
              >
                {{ memberSubmittingId === selectedProject.id ? "添加中..." : "添加成员" }}
              </button>
            </div>

            <div v-if="canRemoveMembers && selectedProject.members.length > 0" class="admin-tag-list admin-mt-12">
              <button
                v-for="member in selectedProject.members"
                :key="member.userId"
                class="admin-button admin-button-secondary"
                :disabled="memberRemovingKey === `${selectedProject.id}:${member.userId}`"
                @click="removeMember(member.userId)"
              >
                {{
                  memberRemovingKey === `${selectedProject.id}:${member.userId}`
                    ? "移除中..."
                    : `移除 ${member.name}`
                }}
              </button>
            </div>
          </div>
        </template>

        <p v-else class="admin-empty">请先从左侧选择一个项目。</p>
      </aside>
    </div>

    <Teleport to="body">
      <div v-if="createModalOpen" class="yb-modal-mask" @click.self="closeCreateModal">
        <div class="yb-modal-card" aria-modal="true" role="dialog">
        <div class="yb-modal-head">
          <h3>新建项目</h3>
          <button class="admin-button admin-button-secondary" @click="closeCreateModal">关闭</button>
        </div>

        <div class="admin-form-grid">
          <div class="admin-field">
            <label>项目名称</label>
            <input v-model.trim="createForm.name" placeholder="例如 智能客服平台" />
          </div>
          <div class="admin-field admin-field-wide">
            <label>项目说明</label>
            <textarea v-model.trim="createForm.description" placeholder="可选，补充项目背景或使用范围" />
          </div>
        </div>

          <div class="admin-actions">
            <button class="admin-button admin-button-primary" :disabled="submitting" @click="submitCreateProject">
              {{ submitting ? "创建中..." : "确认创建" }}
            </button>
            <button class="admin-button admin-button-secondary" :disabled="submitting" @click="resetCreateForm">
              重置
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.project-page-modern {
  gap: 16px;
}

.project-filterbar {
  display: grid;
  gap: 14px;
}

.project-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.project-stat {
  padding: 10px 12px;
  border: 1px solid var(--yb-border);
  border-radius: 10px;
  background: var(--yb-surface-soft);
  display: grid;
  gap: 8px;
}

.project-stat span {
  color: var(--yb-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.project-stat strong {
  color: var(--yb-title);
  font-size: 24px;
  line-height: 1;
}

.project-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 460px;
  gap: 16px;
  align-items: flex-start;
}

.project-list-panel {
  min-height: 520px;
}

.project-row-active td {
  background: #edf5ff;
}

.project-detail-drawer {
  position: sticky;
  top: 12px;
  display: grid;
  gap: 12px;
  max-height: calc(100vh - 130px);
  overflow: auto;
  background:
    radial-gradient(circle at 116% -16%, rgba(90, 165, 255, 0.22), transparent 46%),
    var(--yb-surface);
}

.project-drawer-head {
  display: grid;
  gap: 6px;
}

.project-drawer-head h3 {
  margin: 0;
}

.project-member-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.yb-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(8, 20, 39, 0.46);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  padding: 18px;
}

.yb-modal-card {
  width: min(680px, 100%);
  max-height: min(80vh, 720px);
  overflow: auto;
  background: #fff;
  border: 1px solid var(--yb-border);
  border-radius: 14px;
  box-shadow: var(--yb-shadow-md);
  padding: 16px;
}

.yb-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.yb-modal-head h3 {
  margin: 0;
}

@media (max-width: 1300px) {
  .project-workspace {
    grid-template-columns: 1fr;
  }

  .project-detail-drawer {
    position: static;
    max-height: none;
    overflow: visible;
  }
}
</style>
