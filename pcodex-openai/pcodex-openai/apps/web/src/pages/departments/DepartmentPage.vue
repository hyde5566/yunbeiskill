<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { apiRequest } from "../../api/client";
import { useAuthStore } from "../../stores/auth";
import {
  buildDepartmentEditDraft,
  buildDepartmentUpdatePayload,
  type DepartmentEditDraft,
  type EditableDepartmentRow,
} from "./department-page.helpers";

interface DepartmentRow extends EditableDepartmentRow {}

const authStore = useAuthStore();
const rows = ref<DepartmentRow[]>([]);
const loading = ref(false);
const submitting = ref(false);
const deletingId = ref("");
const selectedDepartmentId = ref("");
const createModalOpen = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const filters = reactive({
  keyword: "",
  parentId: "ALL",
});

const createForm = reactive({
  name: "",
  parentId: "",
  sortOrder: 0,
});

const editDraft = reactive<DepartmentEditDraft>({
  name: "",
  parentId: "",
  sortOrder: 0,
});

const canCreate = computed(() => authStore.currentUser?.permissions.includes("department.create") ?? false);
const canEdit = computed(() => authStore.currentUser?.permissions.includes("department.edit") ?? false);
const canDelete = computed(() => authStore.currentUser?.permissions.includes("department.delete") ?? false);

const orderedRows = computed(() =>
  [...rows.value].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
);
const parentNameMap = computed(() => Object.fromEntries(rows.value.map((row) => [row.id, row.name])));
const selectedDepartment = computed(
  () => rows.value.find((row) => row.id === selectedDepartmentId.value) ?? null,
);
const selectableParents = computed(() =>
  orderedRows.value.filter((row) => row.id !== selectedDepartmentId.value),
);
const parentOptions = computed(() => orderedRows.value);

const filteredRows = computed(() =>
  orderedRows.value.filter((row) => {
    if (filters.keyword) {
      const keyword = filters.keyword.trim().toLowerCase();
      if (!row.name.toLowerCase().includes(keyword)) {
        return false;
      }
    }

    if (filters.parentId === "ROOT") {
      if (row.parentId) {
        return false;
      }
    } else if (filters.parentId !== "ALL") {
      if (row.parentId !== filters.parentId) {
        return false;
      }
    }

    return true;
  }),
);

const stats = computed(() => ({
  total: rows.value.length,
  root: rows.value.filter((row) => !row.parentId).length,
  child: rows.value.filter((row) => Boolean(row.parentId)).length,
  shown: filteredRows.value.length,
}));

function resetMessages() {
  errorMessage.value = "";
  successMessage.value = "";
}

function resetCreateForm() {
  createForm.name = "";
  createForm.parentId = "";
  createForm.sortOrder = 0;
}

function resetFilters() {
  filters.keyword = "";
  filters.parentId = "ALL";
}

function syncEditDraftFromSelected() {
  if (!selectedDepartment.value || !canEdit.value) {
    return;
  }
  Object.assign(editDraft, buildDepartmentEditDraft(selectedDepartment.value));
}

async function loadDepartments() {
  const previousSelectedId = selectedDepartmentId.value;
  rows.value = await apiRequest<DepartmentRow[]>("/departments");

  if (rows.value.some((item) => item.id === previousSelectedId)) {
    selectedDepartmentId.value = previousSelectedId;
    return;
  }
  selectedDepartmentId.value = rows.value[0]?.id ?? "";
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

function openDetailDrawer(id: string) {
  selectedDepartmentId.value = id;
  resetMessages();
}

async function submitCreateDepartment() {
  if (!createForm.name) {
    errorMessage.value = "请填写部门名称";
    successMessage.value = "";
    return;
  }

  submitting.value = true;
  resetMessages();

  try {
    const created = await apiRequest<DepartmentRow>("/departments", {
      method: "POST",
      body: JSON.stringify({
        name: createForm.name,
        parentId: createForm.parentId || undefined,
        sortOrder: Number(createForm.sortOrder),
      }),
    });

    successMessage.value = "部门已创建";
    await loadDepartments();
    closeCreateModal();
    openDetailDrawer(created.id);
    resetCreateForm();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "部门创建失败";
  } finally {
    submitting.value = false;
  }
}

async function submitEditDepartment() {
  if (!selectedDepartment.value) {
    return;
  }

  const payload = buildDepartmentUpdatePayload(selectedDepartment.value, editDraft);
  if (!payload) {
    successMessage.value = "没有可保存的变更";
    errorMessage.value = "";
    return;
  }

  submitting.value = true;
  resetMessages();

  try {
    await apiRequest(`/departments/${selectedDepartment.value.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    successMessage.value = "部门已更新";
    await loadDepartments();
    syncEditDraftFromSelected();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "部门更新失败";
  } finally {
    submitting.value = false;
  }
}

async function removeDepartment() {
  if (!selectedDepartment.value) {
    return;
  }

  deletingId.value = selectedDepartment.value.id;
  resetMessages();

  try {
    await apiRequest(`/departments/${selectedDepartment.value.id}`, { method: "DELETE" });
    successMessage.value = "部门已删除";
    await loadDepartments();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "部门删除失败";
  } finally {
    deletingId.value = "";
  }
}

watch(selectedDepartment, () => {
  syncEditDraftFromSelected();
});

watch(filteredRows, (nextRows) => {
  if (nextRows.length === 0) {
    selectedDepartmentId.value = "";
    return;
  }
  if (!nextRows.some((row) => row.id === selectedDepartmentId.value)) {
    selectedDepartmentId.value = nextRows[0].id;
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
    await loadDepartments();
    syncEditDraftFromSelected();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "部门数据加载失败";
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
  <section class="admin-page department-page-modern">
    <header class="page-header">
      <div>
        <h2>部门管理</h2>
        <p>维护组织树结构，创建走弹窗，详情编辑在右侧工作抽屉中完成。</p>
      </div>
    </header>

    <article class="admin-card department-filterbar">
      <div class="department-stat-grid">
        <div class="department-stat">
          <span>部门总数</span>
          <strong>{{ stats.total }}</strong>
        </div>
        <div class="department-stat">
          <span>一级部门</span>
          <strong>{{ stats.root }}</strong>
        </div>
        <div class="department-stat">
          <span>子部门</span>
          <strong>{{ stats.child }}</strong>
        </div>
        <div class="department-stat">
          <span>当前筛选</span>
          <strong>{{ stats.shown }}</strong>
        </div>
      </div>

      <div class="admin-form-grid">
        <div class="admin-field">
          <label>关键词</label>
          <input v-model.trim="filters.keyword" placeholder="搜索部门名称" />
        </div>
        <div class="admin-field">
          <label>上级部门</label>
          <select v-model="filters.parentId">
            <option value="ALL">全部部门层级</option>
            <option value="ROOT">无上级部门</option>
            <option v-for="row in parentOptions" :key="row.id" :value="row.id">{{ row.name }}</option>
          </select>
        </div>
      </div>

      <div class="admin-actions">
        <button class="admin-button admin-button-secondary" @click="resetFilters">重置筛选</button>
        <button v-if="canCreate" class="admin-button admin-button-primary" @click="openCreateModal">
          新建部门
        </button>
      </div>
    </article>

    <p v-if="errorMessage" class="admin-message admin-message-error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="admin-message admin-message-success">{{ successMessage }}</p>

    <div class="department-workspace">
      <article class="admin-card department-list-panel">
        <h3>部门列表</h3>
        <p v-if="loading" class="admin-empty admin-mt-12">正在加载部门数据...</p>
        <p v-else-if="filteredRows.length === 0" class="admin-empty admin-mt-12">当前筛选条件下没有部门。</p>
        <table v-else class="admin-table admin-mt-12">
          <thead>
            <tr>
              <th>部门名称</th>
              <th>上级部门</th>
              <th>排序</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in filteredRows"
              :key="row.id"
              :class="{ 'department-row-active': row.id === selectedDepartmentId }"
            >
              <td>{{ row.name }}</td>
              <td>{{ row.parentId ? parentNameMap[row.parentId] ?? "-" : "-" }}</td>
              <td>{{ row.sortOrder }}</td>
              <td>
                <button class="admin-button admin-button-secondary" @click="openDetailDrawer(row.id)">
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </article>

      <aside class="admin-card department-detail-drawer">
        <div class="department-drawer-head">
          <h3>{{ selectedDepartment?.name || "部门详情" }}</h3>
        </div>

        <template v-if="selectedDepartment">
          <div class="admin-form-grid">
            <div class="admin-field">
              <label>部门名称</label>
              <input v-model.trim="editDraft.name" :disabled="!canEdit" />
            </div>
            <div class="admin-field">
              <label>上级部门</label>
              <select v-model="editDraft.parentId" :disabled="!canEdit">
                <option value="">无上级部门</option>
                <option v-for="row in selectableParents" :key="row.id" :value="row.id">{{ row.name }}</option>
              </select>
            </div>
            <div class="admin-field">
              <label>排序</label>
              <input v-model.number="editDraft.sortOrder" type="number" min="0" :disabled="!canEdit" />
            </div>
          </div>

          <div class="admin-actions">
            <button
              v-if="canEdit"
              class="admin-button admin-button-primary"
              :disabled="submitting"
              @click="submitEditDepartment"
            >
              {{ submitting ? "保存中..." : "保存变更" }}
            </button>
            <button
              v-if="canDelete"
              class="admin-button admin-button-danger"
              :disabled="deletingId === selectedDepartment.id"
              @click="removeDepartment"
            >
              {{ deletingId === selectedDepartment.id ? "删除中..." : "删除部门" }}
            </button>
          </div>
        </template>

        <p v-else class="admin-empty">请先从左侧选择一个部门。</p>
      </aside>
    </div>

    <Teleport to="body">
      <div v-if="createModalOpen" class="yb-modal-mask" @click.self="closeCreateModal">
        <div class="yb-modal-card" aria-modal="true" role="dialog">
          <div class="yb-modal-head">
            <h3>新建部门</h3>
            <button class="admin-button admin-button-secondary" @click="closeCreateModal">关闭</button>
          </div>

          <div class="admin-form-grid">
            <div class="admin-field">
              <label>部门名称</label>
              <input v-model.trim="createForm.name" placeholder="请输入部门名称" />
            </div>
            <div class="admin-field">
              <label>上级部门</label>
              <select v-model="createForm.parentId">
                <option value="">无上级部门</option>
                <option v-for="row in orderedRows" :key="row.id" :value="row.id">{{ row.name }}</option>
              </select>
            </div>
            <div class="admin-field">
              <label>排序</label>
              <input v-model.number="createForm.sortOrder" type="number" min="0" />
            </div>
          </div>

          <div class="admin-actions">
            <button class="admin-button admin-button-primary" :disabled="submitting" @click="submitCreateDepartment">
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
.department-page-modern {
  gap: 16px;
}

.department-filterbar {
  display: grid;
  gap: 14px;
}

.department-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.department-stat {
  padding: 10px 12px;
  border: 1px solid var(--yb-border);
  border-radius: 10px;
  background: var(--yb-surface-soft);
  display: grid;
  gap: 8px;
}

.department-stat span {
  color: var(--yb-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.department-stat strong {
  color: var(--yb-title);
  font-size: 24px;
  line-height: 1;
}

.department-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 440px;
  gap: 16px;
  align-items: flex-start;
}

.department-list-panel {
  min-height: 520px;
}

.department-row-active td {
  background: #edf5ff;
}

.department-detail-drawer {
  position: sticky;
  top: 12px;
  display: grid;
  gap: 12px;
  background:
    radial-gradient(circle at 118% -18%, rgba(90, 165, 255, 0.22), transparent 46%),
    var(--yb-surface);
}

.department-drawer-head h3 {
  margin: 0;
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
  max-height: min(80vh, 700px);
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

@media (max-width: 1280px) {
  .department-workspace {
    grid-template-columns: 1fr;
  }

  .department-detail-drawer {
    position: static;
  }
}
</style>
