<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiRequest } from "../../api/client";

interface OperationLogRow {
  id: string;
  operatorName: string;
  module: string;
  operationType: string;
  operatedAt: string;
}

const rows = ref<OperationLogRow[]>([]);

onMounted(async () => {
  try {
    rows.value = await apiRequest<OperationLogRow[]>("/operation-logs");
  } catch {
    rows.value = [];
  }
});
</script>

<template>
  <section class="admin-page log-page">
    <header class="page-header">
      <div>
        <h2>操作日志</h2>
        <p>记录关键模块操作轨迹，支持复盘权限动作和业务操作过程。</p>
      </div>
    </header>

    <article class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>操作人</th>
            <th>模块</th>
            <th>类型</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.operatorName }}</td>
            <td>{{ row.module }}</td>
            <td>{{ row.operationType }}</td>
            <td>{{ new Date(row.operatedAt).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>
