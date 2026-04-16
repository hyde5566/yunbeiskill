<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apiRequest } from "../../api/client";

interface LoginLogRow {
  id: string;
  account: string;
  result: string;
  loginAt: string;
  loginIp?: string | null;
}

const rows = ref<LoginLogRow[]>([]);

onMounted(async () => {
  try {
    rows.value = await apiRequest<LoginLogRow[]>("/login-logs");
  } catch {
    rows.value = [];
  }
});
</script>

<template>
  <section class="admin-page log-page">
    <header class="page-header">
      <div>
        <h2>登录日志</h2>
        <p>查看账号登录历史，用于核查登录状态、异常地点和失败情况。</p>
      </div>
    </header>

    <article class="admin-card">
      <table class="admin-table">
        <thead>
          <tr>
            <th>账号</th>
            <th>结果</th>
            <th>登录时间</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.account }}</td>
            <td>
              <span
                class="admin-tag"
                :class="row.result === 'SUCCESS' ? 'admin-tag-success' : 'admin-tag-danger'"
              >
                {{ row.result }}
              </span>
            </td>
            <td>{{ new Date(row.loginAt).toLocaleString() }}</td>
            <td>{{ row.loginIp || "-" }}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </section>
</template>
