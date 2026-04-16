<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { apiRequest } from "../../api/client";
import { useAuthStore } from "../../stores/auth";
import {
  buildRoleEditDraft,
  buildRoleUpdatePayload,
  type EditableRoleRow,
  type RoleEditDraft,
} from "./role-page.helpers";

interface RoleRow extends EditableRoleRow {}

interface PermissionRow {
  id: string;
  module: string;
  code: string;
  name: string;
  description?: string | null;
}

const authStore = useAuthStore();
const rows = ref<RoleRow[]>([]);
const permissions = ref<PermissionRow[]>([]);
const loading = ref(false);
const submitting = ref(false);
const deletingId = ref("");
const selectedRoleId = ref("");
const createModalOpen = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const filters = reactive({
  keyword: "",
  module: "",
  status: "ALL",
});

const createForm = reactive({
  name: "",
  description: "",
  permissionCodes: [] as string[],
});

const editDraft = reactive<RoleEditDraft>({
  name: "",
  description: "",
  permissionCodes: [],
});

const canCreate = computed(() => authStore.currentUser?.permissions.includes("role.create") ?? false);
const canEdit = computed(() => authStore.currentUser?.permissions.includes("role.edit") ?? false);
const canDelete = computed(() => authStore.currentUser?.permissions.includes("role.delete") ?? false);
const shouldLoadPermissions = computed(() => canCreate.value || canEdit.value);
const selectedRole = computed(() => rows.value.find((row) => row.id === selectedRoleId.value) ?? null);

const groupedPermissions = computed(() => {
  const groups = new Map<string, PermissionRow[]>();

  for (const permission of permissions.value) {
    const list = groups.get(permission.module) ?? [];
    list.push(permission);
    groups.set(permission.module, list);
  }

  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], "zh-CN"));
});

const moduleOptions = computed(() => groupedPermissions.value.map(([module]) => module));

const filteredRows = computed(() =>
  rows.value.filter((row) => {
    if (filters.keyword) {
      const keyword = filters.keyword.trim().toLowerCase();
      if (!row.code.toLowerCase().includes(keyword) && !row.name.toLowerCase().includes(keyword)) {
        return false;
      }
    }

    if (filters.status !== "ALL" && row.status !== filters.status) {
      return false;
    }

    if (filters.module) {
      const rolePermissionModules = new Set(
        row.permissionCodes
          .map((permissionCode) => permissions.value.find((permission) => permission.code === permissionCode)?.module)
          .filter((item): item is string => Boolean(item)),
      );

      if (!rolePermissionModules.has(filters.module)) {
        return false;
      }
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

const permissionNameMap = computed(() =>
  Object.fromEntries(permissions.value.map((permission) => [permission.code, permission.name])),
);

function resetMessages() {
  errorMessage.value = "";
  successMessage.value = "";
}

function resetCreateForm() {
  createForm.name = "";
  createForm.description = "";
  createForm.permissionCodes = [];
}

function resetFilters() {
  filters.keyword = "";
  filters.module = "";
  filters.status = "ALL";
}

function togglePermission(target: { permissionCodes: string[] }, code: string, enabled: boolean) {
  if (enabled) {
    if (!target.permissionCodes.includes(code)) {
      target.permissionCodes = [...target.permissionCodes, code];
    }
    return;
  }

  target.permissionCodes = target.permissionCodes.filter((item) => item !== code);
}

function formatStatusLabel(status: string) {
  return status === "ACTIVE" ? "启用" : "停用";
}

function syncEditDraftFromSelected() {
  if (!selectedRole.value || !canEdit.value) {
    return;
  }
  Object.assign(editDraft, buildRoleEditDraft(selectedRole.value));
}

async function loadRoles() {
  const previousSelectedId = selectedRoleId.value;
  rows.value = await apiRequest<RoleRow[]>("/roles");

  if (rows.value.some((item) => item.id === previousSelectedId)) {
    selectedRoleId.value = previousSelectedId;
    return;
  }
  selectedRoleId.value = rows.value[0]?.id ?? "";
}

async function loadPermissions() {
  if (!shouldLoadPermissions.value) {
    permissions.value = [];
    return;
  }
  permissions.value = await apiRequest<PermissionRow[]>("/permissions");
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

function openDetailDrawer(roleId: string) {
  selectedRoleId.value = roleId;
  resetMessages();
}

async function submitCreateRole() {
  if (!createForm.name || createForm.permissionCodes.length === 0) {
    errorMessage.value = "请填写角色名称，并至少选择一个权限点";
    successMessage.value = "";
    return;
  }

  const generatedCode = `role-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  submitting.value = true;
  resetMessages();

  try {
    const createdRole = await apiRequest<RoleRow>("/roles", {
      method: "POST",
      body: JSON.stringify({
        code: generatedCode,
        name: createForm.name,
        description: createForm.description || undefined,
        permissionCodes: createForm.permissionCodes,
      }),
    });

    successMessage.value = "角色已创建";
    resetCreateForm();
    await loadRoles();
    closeCreateModal();
    openDetailDrawer(createdRole.id);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "角色创建失败";
  } finally {
    submitting.value = false;
  }
}

async function submitEditRole() {
  if (!selectedRole.value) {
    return;
  }

  const payload = buildRoleUpdatePayload(selectedRole.value, editDraft);
  if (!payload) {
    successMessage.value = "没有可保存的变更";
    errorMessage.value = "";
    return;
  }

  submitting.value = true;
  resetMessages();

  try {
    await apiRequest(`/roles/${selectedRole.value.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    successMessage.value = "角色已更新";
    await loadRoles();
    syncEditDraftFromSelected();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "角色更新失败";
  } finally {
    submitting.value = false;
  }
}

async function removeRole() {
  if (!selectedRole.value) {
    return;
  }

  deletingId.value = selectedRole.value.id;
  resetMessages();

  try {
    await apiRequest(`/roles/${selectedRole.value.id}`, { method: "DELETE" });
    successMessage.value = "角色已删除";
    await loadRoles();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "角色删除失败";
  } finally {
    deletingId.value = "";
  }
}

watch(selectedRole, () => {
  syncEditDraftFromSelected();
});

watch(filteredRows, (nextRows) => {
  if (nextRows.length === 0) {
    selectedRoleId.value = "";
    return;
  }
  if (!nextRows.some((row) => row.id === selectedRoleId.value)) {
    selectedRoleId.value = nextRows[0].id;
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
    await Promise.all([loadRoles(), loadPermissions()]);
    syncEditDraftFromSelected();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "角色数据加载失败";
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
  <section class="admin-page role-page-modern">
    <header class="page-header">
      <div>
        <h2>角色管理</h2>
        <p>在单页工作区完成角色筛选、权限查看和编辑，创建改为独立弹窗。</p>
      </div>
    </header>

    <article class="admin-card role-filterbar">
      <div class="role-stat-grid">
        <div class="role-stat">
          <span>角色总数</span>
          <strong>{{ stats.total }}</strong>
        </div>
        <div class="role-stat">
          <span>启用角色</span>
          <strong>{{ stats.active }}</strong>
        </div>
        <div class="role-stat">
          <span>停用角色</span>
          <strong>{{ stats.disabled }}</strong>
        </div>
        <div class="role-stat">
          <span>当前筛选</span>
          <strong>{{ stats.shown }}</strong>
        </div>
      </div>

      <div class="admin-form-grid">
        <div class="admin-field">
          <label>关键词</label>
          <input v-model.trim="filters.keyword" placeholder="搜索角色编码或名称" />
        </div>
        <div class="admin-field">
          <label>权限模块</label>
          <select v-model="filters.module">
            <option value="">全部模块</option>
            <option v-for="module in moduleOptions" :key="module" :value="module">{{ module }}</option>
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
          新建角色
        </button>
      </div>
    </article>

    <p v-if="errorMessage" class="admin-message admin-message-error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="admin-message admin-message-success">{{ successMessage }}</p>

    <div class="role-workspace">
      <article class="admin-card role-list-panel">
        <h3>角色列表</h3>
        <p v-if="loading" class="admin-empty admin-mt-12">正在加载角色数据...</p>
        <p v-else-if="filteredRows.length === 0" class="admin-empty admin-mt-12">当前筛选条件下没有角色。</p>
        <table v-else class="admin-table admin-mt-12">
          <thead>
            <tr>
              <th>角色名称</th>
              <th>角色编码</th>
              <th>权限点数量</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredRows" :key="row.id" :class="{ 'role-row-active': row.id === selectedRoleId }">
              <td>{{ row.name }}</td>
              <td>{{ row.code }}</td>
              <td>{{ row.permissionCodes.length }}</td>
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

      <aside class="admin-card role-detail-drawer">
        <div class="role-drawer-head">
          <h3>{{ selectedRole?.name || "角色详情" }}</h3>
          <p v-if="selectedRole" class="admin-empty">{{ selectedRole.code }}</p>
        </div>

        <template v-if="selectedRole">
          <div class="admin-form-grid">
            <div class="admin-field">
              <label>角色编码</label>
              <input :value="selectedRole.code" disabled />
            </div>
            <div class="admin-field">
              <label>角色名称</label>
              <input v-model.trim="editDraft.name" :disabled="!canEdit" />
            </div>
            <div class="admin-field admin-field-wide">
              <label>角色说明</label>
              <textarea v-model.trim="editDraft.description" :disabled="!canEdit" />
            </div>
          </div>

          <div class="role-permission-grid admin-mt-12">
            <div v-for="[module, modulePermissions] in groupedPermissions" :key="module" class="admin-card">
              <strong>{{ module }}</strong>
              <div class="admin-form-grid admin-mt-10">
                <label
                  v-for="permission in modulePermissions"
                  :key="permission.code"
                  class="admin-field admin-checkbox-row admin-checkbox-row-top"
                >
                  <input
                    :checked="editDraft.permissionCodes.includes(permission.code)"
                    type="checkbox"
                    :disabled="!canEdit"
                    @change="
                      togglePermission(
                        editDraft,
                        permission.code,
                        ($event.target as HTMLInputElement).checked,
                      )
                    "
                  />
                  <span>{{ permission.name }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="admin-actions">
            <button
              v-if="canEdit"
              class="admin-button admin-button-primary"
              :disabled="submitting"
              @click="submitEditRole"
            >
              {{ submitting ? "保存中..." : "保存变更" }}
            </button>
            <button
              v-if="canDelete"
              class="admin-button admin-button-danger"
              :disabled="deletingId === selectedRole.id"
              @click="removeRole"
            >
              {{ deletingId === selectedRole.id ? "删除中..." : "删除角色" }}
            </button>
          </div>

          <div class="admin-card admin-mt-12">
            <strong>已分配权限</strong>
            <div class="admin-tag-list admin-mt-12">
              <span
                v-for="permissionCode in selectedRole.permissionCodes"
                :key="permissionCode"
                class="admin-tag"
              >
                {{ permissionNameMap[permissionCode] ?? permissionCode }}
              </span>
              <span v-if="selectedRole.permissionCodes.length === 0" class="admin-empty">无权限点</span>
            </div>
          </div>
        </template>

        <p v-else class="admin-empty">请先从左侧选择一个角色。</p>
      </aside>
    </div>

    <Teleport to="body">
      <div v-if="createModalOpen" class="yb-modal-mask" @click.self="closeCreateModal">
        <div class="yb-modal-card" aria-modal="true" role="dialog">
        <div class="yb-modal-head">
          <h3>新建角色</h3>
          <button class="admin-button admin-button-secondary" @click="closeCreateModal">关闭</button>
        </div>

        <div class="admin-form-grid">
          <div class="admin-field">
            <label>角色名称</label>
            <input v-model.trim="createForm.name" placeholder="例如 审核员" />
          </div>
          <div class="admin-field admin-field-wide">
            <label>角色说明</label>
            <textarea v-model.trim="createForm.description" placeholder="说明角色职责边界" />
          </div>
        </div>

        <div class="role-permission-grid admin-mt-12">
          <div v-for="[module, modulePermissions] in groupedPermissions" :key="module" class="admin-card">
            <strong>{{ module }}</strong>
            <div class="admin-form-grid admin-mt-10">
              <label
                v-for="permission in modulePermissions"
                :key="permission.code"
                class="admin-field admin-checkbox-row admin-checkbox-row-top"
              >
                <input
                  :checked="createForm.permissionCodes.includes(permission.code)"
                  type="checkbox"
                  @change="
                    togglePermission(
                      createForm,
                      permission.code,
                      ($event.target as HTMLInputElement).checked,
                    )
                  "
                />
                <span>{{ permission.name }}</span>
              </label>
            </div>
          </div>
        </div>

          <div class="admin-actions">
            <button class="admin-button admin-button-primary" :disabled="submitting" @click="submitCreateRole">
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
.role-page-modern {
  gap: 16px;
}

.role-filterbar {
  display: grid;
  gap: 14px;
}

.role-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.role-stat {
  padding: 10px 12px;
  border: 1px solid var(--yb-border);
  border-radius: 10px;
  background: var(--yb-surface-soft);
  display: grid;
  gap: 8px;
}

.role-stat span {
  color: var(--yb-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.role-stat strong {
  color: var(--yb-title);
  font-size: 24px;
  line-height: 1;
}

.role-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 460px;
  gap: 16px;
  align-items: flex-start;
}

.role-list-panel {
  min-height: 520px;
}

.role-row-active td {
  background: #edf5ff;
}

.role-detail-drawer {
  position: sticky;
  top: 12px;
  display: grid;
  gap: 12px;
  max-height: calc(100vh - 130px);
  overflow: auto;
  background:
    radial-gradient(circle at 120% -18%, rgba(90, 165, 255, 0.22), transparent 46%),
    var(--yb-surface);
}

.role-drawer-head {
  display: grid;
  gap: 6px;
}

.role-drawer-head h3 {
  margin: 0;
}

.role-permission-grid {
  display: grid;
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
  width: min(860px, 100%);
  max-height: min(86vh, 900px);
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
  .role-workspace {
    grid-template-columns: 1fr;
  }

  .role-detail-drawer {
    position: static;
    max-height: none;
    overflow: visible;
  }
}
</style>
