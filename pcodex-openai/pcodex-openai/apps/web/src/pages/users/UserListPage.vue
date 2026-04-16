<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { apiRequest } from "../../api/client";
import { useAuthStore } from "../../stores/auth";
import {
  buildUserEditDraft,
  buildUserMutations,
  type EditableUserRow,
  type UserEditDraft,
} from "./user-page.helpers";

interface UserRow extends EditableUserRow {}

interface DepartmentOption {
  id: string;
  name: string;
}

interface RoleOption {
  id: string;
  name: string;
}

const authStore = useAuthStore();
const rows = ref<UserRow[]>([]);
const departments = ref<DepartmentOption[]>([]);
const roles = ref<RoleOption[]>([]);
const loading = ref(false);
const submitting = ref(false);
const statusUpdatingId = ref("");
const deletingId = ref("");
const selectedUserId = ref("");
const createModalOpen = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const filters = reactive({
  keyword: "",
  department: "",
  roleId: "",
  status: "ALL",
});

const createForm = reactive({
  account: "",
  name: "",
  password: "",
  departmentId: "",
  roleIds: [] as string[],
});

const editDraft = reactive<UserEditDraft>({
  name: "",
  departmentId: "",
  roleIds: [],
});

const canCreate = computed(() => authStore.currentUser?.permissions.includes("user.create") ?? false);
const canEditProfile = computed(() => authStore.currentUser?.permissions.includes("user.edit") ?? false);
const canAssignRoles = computed(
  () => authStore.currentUser?.permissions.includes("user.assign-role") ?? false,
);
const canToggleStatus = computed(
  () => authStore.currentUser?.permissions.includes("user.enable-disable") ?? false,
);
const canDelete = computed(() => authStore.currentUser?.permissions.includes("user.delete") ?? false);
const canOpenEditor = computed(() => canEditProfile.value || canAssignRoles.value);
const shouldLoadDepartments = computed(() => canCreate.value || canEditProfile.value);
const shouldLoadRoles = computed(() => canCreate.value || canAssignRoles.value);
const selectedUser = computed(() => rows.value.find((row) => row.id === selectedUserId.value) ?? null);

const departmentFilterOptions = computed(() => {
  const names = new Set<string>();
  for (const row of rows.value) {
    names.add(row.department.name);
  }
  return [...names].sort((a, b) => a.localeCompare(b, "zh-CN"));
});

const roleFilterOptions = computed(() => {
  const roleMap = new Map<string, string>();
  for (const row of rows.value) {
    for (const role of row.roles) {
      roleMap.set(role.id, role.name);
    }
  }

  return [...roleMap.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
});

const filteredRows = computed(() =>
  rows.value.filter((row) => {
    if (filters.keyword) {
      const keyword = filters.keyword.trim().toLowerCase();
      if (!row.account.toLowerCase().includes(keyword) && !row.name.toLowerCase().includes(keyword)) {
        return false;
      }
    }

    if (filters.department && row.department.name !== filters.department) {
      return false;
    }

    if (filters.roleId && !row.roles.some((role) => role.id === filters.roleId)) {
      return false;
    }

    if (filters.status !== "ALL" && row.status !== filters.status) {
      return false;
    }

    return true;
  }),
);

const dashboardStats = computed(() => ({
  total: rows.value.length,
  active: rows.value.filter((row) => row.status === "ACTIVE").length,
  disabled: rows.value.filter((row) => row.status === "DISABLED").length,
  shown: filteredRows.value.length,
}));

function resetMessages() {
  errorMessage.value = "";
  successMessage.value = "";
}

function resetCreateForm() {
  createForm.account = "";
  createForm.name = "";
  createForm.password = "";
  createForm.departmentId = departments.value[0]?.id ?? "";
  createForm.roleIds = [];
}

function resetFilters() {
  filters.keyword = "";
  filters.department = "";
  filters.roleId = "";
  filters.status = "ALL";
}

function toggleRole(roleIds: string[], roleId: string, enabled: boolean) {
  if (enabled) {
    return roleIds.includes(roleId) ? roleIds : [...roleIds, roleId];
  }

  return roleIds.filter((item) => item !== roleId);
}

function toggleCreateRole(roleId: string, enabled: boolean) {
  createForm.roleIds = toggleRole(createForm.roleIds, roleId, enabled);
}

function toggleEditRole(roleId: string, enabled: boolean) {
  editDraft.roleIds = toggleRole(editDraft.roleIds, roleId, enabled);
}

function formatStatusLabel(status: string) {
  return status === "ACTIVE" ? "启用" : "停用";
}

function syncEditDraftFromSelected() {
  if (!selectedUser.value || !canOpenEditor.value) {
    return;
  }
  Object.assign(editDraft, buildUserEditDraft(selectedUser.value));
}

async function loadUsers() {
  const previousSelectedId = selectedUserId.value;
  rows.value = await apiRequest<UserRow[]>("/users");

  if (rows.value.some((item) => item.id === previousSelectedId)) {
    selectedUserId.value = previousSelectedId;
    return;
  }

  selectedUserId.value = rows.value[0]?.id ?? "";
}

async function loadOptions() {
  const requests: Array<Promise<unknown>> = [];

  if (shouldLoadDepartments.value) {
    requests.push(
      apiRequest<DepartmentOption[]>("/departments").then((departmentRows) => {
        departments.value = departmentRows;
        if (!createForm.departmentId && departments.value.length > 0) {
          createForm.departmentId = departments.value[0].id;
        }
      }),
    );
  } else {
    departments.value = [];
  }

  if (shouldLoadRoles.value) {
    requests.push(
      apiRequest<RoleOption[]>("/roles").then((roleRows) => {
        roles.value = roleRows;
      }),
    );
  } else {
    roles.value = [];
  }

  await Promise.all(requests);
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

function openDetailDrawer(userId: string) {
  selectedUserId.value = userId;
  resetMessages();
}

async function submitCreateUser() {
  if (
    !createForm.account ||
    !createForm.name ||
    !createForm.password ||
    !createForm.departmentId ||
    createForm.roleIds.length === 0
  ) {
    errorMessage.value = "请完整填写账号、姓名、密码、部门和角色";
    successMessage.value = "";
    return;
  }

  const createdAccount = createForm.account;
  submitting.value = true;
  resetMessages();

  try {
    await apiRequest("/users", {
      method: "POST",
      body: JSON.stringify(createForm),
    });

    successMessage.value = "用户已创建";
    await loadUsers();
    closeCreateModal();
    const created = rows.value.find((row) => row.account === createdAccount);
    if (created) {
      openDetailDrawer(created.id);
    }
    resetCreateForm();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "用户创建失败";
  } finally {
    submitting.value = false;
  }
}

async function submitEditUser() {
  if (!selectedUser.value) {
    return;
  }

  const { profilePayload, rolePayload } = buildUserMutations(selectedUser.value, editDraft);

  if (!profilePayload && !rolePayload) {
    successMessage.value = "没有可保存的变更";
    errorMessage.value = "";
    return;
  }

  submitting.value = true;
  resetMessages();

  try {
    if (profilePayload) {
      await apiRequest(`/users/${selectedUser.value.id}`, {
        method: "PATCH",
        body: JSON.stringify(profilePayload),
      });
    }

    if (rolePayload) {
      await apiRequest(`/users/${selectedUser.value.id}/roles`, {
        method: "PATCH",
        body: JSON.stringify(rolePayload),
      });
    }

    successMessage.value = "用户信息已更新";
    await loadUsers();
    syncEditDraftFromSelected();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "用户更新失败";
  } finally {
    submitting.value = false;
  }
}

async function toggleUserStatus() {
  if (!selectedUser.value) {
    return;
  }

  statusUpdatingId.value = selectedUser.value.id;
  resetMessages();

  const nextStatus = selectedUser.value.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

  try {
    await apiRequest(`/users/${selectedUser.value.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    });

    successMessage.value = `用户已${nextStatus === "ACTIVE" ? "启用" : "停用"}`;
    await loadUsers();
    syncEditDraftFromSelected();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "状态更新失败";
  } finally {
    statusUpdatingId.value = "";
  }
}

async function removeUser() {
  if (!selectedUser.value) {
    return;
  }

  const confirmed = window.confirm(`确认删除账号“${selectedUser.value.account}”吗？`);
  if (!confirmed) {
    return;
  }

  deletingId.value = selectedUser.value.id;
  resetMessages();

  try {
    await apiRequest(`/users/${selectedUser.value.id}`, {
      method: "DELETE",
    });

    successMessage.value = "用户已删除";
    await loadUsers();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "用户删除失败";
  } finally {
    deletingId.value = "";
  }
}

watch(selectedUser, () => {
  syncEditDraftFromSelected();
});

watch(filteredRows, (nextRows) => {
  if (nextRows.length === 0) {
    selectedUserId.value = "";
    return;
  }
  if (!nextRows.some((row) => row.id === selectedUserId.value)) {
    selectedUserId.value = nextRows[0].id;
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
    await Promise.all([loadUsers(), loadOptions()]);
    syncEditDraftFromSelected();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "用户数据加载失败";
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
  <section class="admin-page user-page-modern">
    <header class="page-header">
      <div>
        <h2>用户管理</h2>
        <p>筛选、查看、编辑、启停用和删除都在同一工作区完成，减少页面切换成本。</p>
      </div>
    </header>

    <article class="admin-card user-filterbar">
      <div class="user-stat-grid">
        <div class="user-stat">
          <span>账号总数</span>
          <strong>{{ dashboardStats.total }}</strong>
        </div>
        <div class="user-stat">
          <span>启用账号</span>
          <strong>{{ dashboardStats.active }}</strong>
        </div>
        <div class="user-stat">
          <span>停用账号</span>
          <strong>{{ dashboardStats.disabled }}</strong>
        </div>
        <div class="user-stat">
          <span>当前筛选</span>
          <strong>{{ dashboardStats.shown }}</strong>
        </div>
      </div>

      <div class="admin-form-grid">
        <div class="admin-field">
          <label>关键词</label>
          <input v-model.trim="filters.keyword" placeholder="搜索账号或姓名" />
        </div>
        <div class="admin-field">
          <label>部门</label>
          <select v-model="filters.department">
            <option value="">全部部门</option>
            <option v-for="department in departmentFilterOptions" :key="department" :value="department">
              {{ department }}
            </option>
          </select>
        </div>
        <div class="admin-field">
          <label>角色</label>
          <select v-model="filters.roleId">
            <option value="">全部角色</option>
            <option v-for="role in roleFilterOptions" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>
        <div class="admin-field">
          <label>状态</label>
          <select v-model="filters.status">
            <option value="ALL">全部状态</option>
            <option value="ACTIVE">启用</option>
            <option value="DISABLED">停用</option>
          </select>
        </div>
      </div>

      <div class="admin-actions">
        <button class="admin-button admin-button-secondary" @click="resetFilters">重置筛选</button>
        <button v-if="canCreate" class="admin-button admin-button-primary" @click="openCreateModal">
          新建用户
        </button>
      </div>
    </article>

    <p v-if="errorMessage" class="admin-message admin-message-error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="admin-message admin-message-success">{{ successMessage }}</p>

    <div class="user-workspace">
      <article class="admin-card user-list-panel">
        <h3>账号列表</h3>
        <p v-if="loading" class="admin-empty admin-mt-12">正在加载用户数据...</p>
        <p v-else-if="filteredRows.length === 0" class="admin-empty admin-mt-12">当前筛选条件下没有用户。</p>
        <table v-else class="admin-table admin-mt-12">
          <thead>
            <tr>
              <th>账号</th>
              <th>姓名</th>
              <th>部门</th>
              <th>角色</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredRows" :key="row.id" :class="{ 'user-row-active': row.id === selectedUserId }">
              <td>{{ row.account }}</td>
              <td>{{ row.name }}</td>
              <td>{{ row.department.name }}</td>
              <td>{{ row.roles.map((role) => role.name).join(" / ") }}</td>
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

      <aside class="admin-card user-detail-drawer">
        <div class="user-drawer-head">
          <h3>{{ selectedUser?.name || "用户详情" }}</h3>
          <p v-if="selectedUser" class="admin-empty">{{ selectedUser.account }}</p>
        </div>

        <template v-if="selectedUser">
          <div class="admin-form-grid">
            <div class="admin-field">
              <label>登录账号</label>
              <input :value="selectedUser.account" disabled />
            </div>
            <div class="admin-field">
              <label>姓名</label>
              <input v-model.trim="editDraft.name" :disabled="!canEditProfile" />
            </div>
            <div class="admin-field">
              <label>所属部门</label>
              <select v-model="editDraft.departmentId" :disabled="!canEditProfile">
                <option v-for="department in departments" :key="department.id" :value="department.id">
                  {{ department.name }}
                </option>
              </select>
            </div>
            <div class="admin-field">
              <label>当前状态</label>
              <input :value="formatStatusLabel(selectedUser.status)" disabled />
            </div>
          </div>

          <div class="admin-field admin-section-top">
            <label>角色配置</label>
            <div class="admin-form-grid">
              <label v-for="role in roles" :key="role.id" class="admin-field admin-checkbox-row">
                <input
                  :checked="editDraft.roleIds.includes(role.id)"
                  :disabled="!canAssignRoles"
                  type="checkbox"
                  @change="toggleEditRole(role.id, ($event.target as HTMLInputElement).checked)"
                />
                <span>{{ role.name }}</span>
              </label>
            </div>
          </div>

          <div class="admin-actions">
            <button
              v-if="canOpenEditor"
              class="admin-button admin-button-primary"
              :disabled="submitting"
              @click="submitEditUser"
            >
              {{ submitting ? "保存中..." : "保存变更" }}
            </button>
            <button
              v-if="canToggleStatus"
              class="admin-button"
              :class="selectedUser.status === 'ACTIVE' ? 'admin-button-danger' : 'admin-button-primary'"
              :disabled="statusUpdatingId === selectedUser.id"
              @click="toggleUserStatus"
            >
              {{
                statusUpdatingId === selectedUser.id
                  ? "处理中..."
                  : selectedUser.status === "ACTIVE"
                    ? "停用账号"
                    : "启用账号"
              }}
            </button>
            <button
              v-if="canDelete"
              class="admin-button admin-button-danger"
              :disabled="deletingId === selectedUser.id"
              @click="removeUser"
            >
              {{ deletingId === selectedUser.id ? "删除中..." : "删除账号" }}
            </button>
          </div>
        </template>

        <p v-else class="admin-empty">请先从左侧选择一个用户。</p>
      </aside>
    </div>

    <Teleport to="body">
      <div v-if="createModalOpen" class="yb-modal-mask" @click.self="closeCreateModal">
        <div class="yb-modal-card" aria-modal="true" role="dialog">
        <div class="yb-modal-head">
          <h3>新建用户</h3>
          <button class="admin-button admin-button-secondary" @click="closeCreateModal">关闭</button>
        </div>

        <div class="admin-form-grid">
          <div class="admin-field">
            <label>登录账号</label>
            <input v-model.trim="createForm.account" placeholder="例如 zhangsan" />
          </div>
          <div class="admin-field">
            <label>姓名</label>
            <input v-model.trim="createForm.name" placeholder="请输入姓名" />
          </div>
          <div class="admin-field">
            <label>初始密码</label>
            <input v-model.trim="createForm.password" type="password" placeholder="至少 8 位" />
          </div>
          <div class="admin-field">
            <label>所属部门</label>
            <select v-model="createForm.departmentId">
              <option value="">请选择部门</option>
              <option v-for="department in departments" :key="department.id" :value="department.id">
                {{ department.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="admin-field admin-section-top">
          <label>分配角色</label>
          <div class="admin-form-grid">
            <label v-for="role in roles" :key="role.id" class="admin-field admin-checkbox-row">
              <input
                :checked="createForm.roleIds.includes(role.id)"
                type="checkbox"
                @change="toggleCreateRole(role.id, ($event.target as HTMLInputElement).checked)"
              />
              <span>{{ role.name }}</span>
            </label>
          </div>
        </div>

          <div class="admin-actions">
            <button class="admin-button admin-button-primary" :disabled="submitting" @click="submitCreateUser">
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
.user-page-modern {
  gap: 16px;
}

.user-filterbar {
  display: grid;
  gap: 14px;
}

.user-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.user-stat {
  padding: 10px 12px;
  border: 1px solid var(--yb-border);
  border-radius: 10px;
  background: var(--yb-surface-soft);
  display: grid;
  gap: 8px;
}

.user-stat span {
  color: var(--yb-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.user-stat strong {
  color: var(--yb-title);
  font-size: 24px;
  line-height: 1;
}

.user-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 16px;
  align-items: flex-start;
}

.user-list-panel {
  min-height: 520px;
}

.user-row-active td {
  background: #edf5ff;
}

.user-detail-drawer {
  position: sticky;
  top: 12px;
  display: grid;
  gap: 12px;
  background:
    radial-gradient(circle at 110% -20%, rgba(90, 165, 255, 0.22), transparent 45%),
    var(--yb-surface);
}

.user-drawer-head {
  display: grid;
  gap: 6px;
}

.user-drawer-head h3 {
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
  width: min(760px, 100%);
  max-height: min(86vh, 860px);
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

@media (max-width: 1200px) {
  .user-workspace {
    grid-template-columns: 1fr;
  }

  .user-detail-drawer {
    position: static;
  }
}
</style>
