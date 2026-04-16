<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { apiRequest } from "../../api/client";
import { useAuthStore } from "../../stores/auth";

interface SkillCategoryRow {
  id: string;
  name: string;
  sortOrder: number;
  status: "ACTIVE" | "DISABLED";
}

const authStore = useAuthStore();
const rows = ref<SkillCategoryRow[]>([]);
const loading = ref(false);
const savingId = ref("");
const errorMessage = ref("");
const successMessage = ref("");

const canEdit = computed(() =>
  authStore.currentUser?.permissions.includes("skill-category.edit") ?? false,
);

function resetMessages() {
  errorMessage.value = "";
  successMessage.value = "";
}

async function loadCategories() {
  rows.value = await apiRequest<SkillCategoryRow[]>("/skill-categories");
}

async function saveCategory(row: SkillCategoryRow) {
  savingId.value = row.id;
  resetMessages();

  try {
    await apiRequest(`/skill-categories/${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: row.name,
        sortOrder: Number(row.sortOrder),
        status: row.status,
      }),
    });

    successMessage.value = `分类「${row.name}」已更新`;
    await loadCategories();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "分类更新失败";
  } finally {
    savingId.value = "";
  }
}

onMounted(async () => {
  loading.value = true;
  resetMessages();

  try {
    await loadCategories();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "分类数据加载失败";
    rows.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="admin-page">
    <header class="page-header">
      <div>
        <h2>Skill 分类管理</h2>
        <p>首期预置分类已经初始化，这里负责名称、排序和启停用的日常维护。</p>
      </div>
    </header>

    <p v-if="errorMessage" class="admin-message admin-message-error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="admin-message admin-message-success">{{ successMessage }}</p>

    <article class="admin-card">
      <h3>分类列表</h3>
      <p v-if="loading" class="admin-empty">正在加载分类数据...</p>
      <p v-else-if="rows.length === 0" class="admin-empty">当前还没有分类数据。</p>
      <table v-else class="admin-table">
        <thead>
          <tr>
            <th>分类</th>
            <th>排序</th>
            <th>状态</th>
            <th v-if="canEdit">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>
              <input
                v-if="canEdit"
                v-model.trim="row.name"
                style="width: 100%; min-height: 36px; border: 1px solid var(--yb-border-strong); border-radius: 8px; padding: 8px 10px"
              />
              <span v-else>{{ row.name }}</span>
            </td>
            <td>
              <input
                v-if="canEdit"
                v-model.number="row.sortOrder"
                type="number"
                min="0"
                style="width: 100%; min-height: 36px; border: 1px solid var(--yb-border-strong); border-radius: 8px; padding: 8px 10px"
              />
              <span v-else>{{ row.sortOrder }}</span>
            </td>
            <td>
              <select
                v-if="canEdit"
                v-model="row.status"
                style="width: 100%; min-height: 36px; border: 1px solid var(--yb-border-strong); border-radius: 8px; padding: 8px 10px"
              >
                <option value="ACTIVE">启用</option>
                <option value="DISABLED">停用</option>
              </select>
              <span v-else>{{ row.status === "ACTIVE" ? "启用" : "停用" }}</span>
            </td>
            <td v-if="canEdit">
              <div class="admin-table-actions">
                <button
                  class="admin-button admin-button-primary"
                  :disabled="savingId === row.id"
                  @click="saveCategory(row)"
                >
                  {{ savingId === row.id ? "保存中..." : "保存" }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>
