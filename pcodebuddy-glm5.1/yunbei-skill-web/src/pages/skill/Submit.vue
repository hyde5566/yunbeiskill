<template>
  <div class="skill-submit">
    <a-card :bordered="false" :title="isEdit ? '编辑Skill' : '提交Skill'" class="submit-card">
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-divider orientation="left">基本信息</a-divider>

        <a-form-item label="Skill名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入Skill名称" :maxlength="100" show-count />
        </a-form-item>

        <a-form-item label="简介" name="summary">
          <a-textarea v-model:value="form.summary" placeholder="请输入简短描述，不超过100字" :maxlength="100" show-count :rows="2" />
        </a-form-item>

        <a-form-item label="详细说明" name="detail">
          <a-textarea v-model:value="form.detail" placeholder="请输入完整的Skill说明" :rows="6" />
        </a-form-item>

        <a-form-item label="作者" name="author">
          <a-input v-model:value="form.author" placeholder="请输入作者姓名" :maxlength="50" />
        </a-form-item>

        <a-form-item label="分类" name="categoryId">
          <a-select v-model:value="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="来源" name="sourceType">
          <a-radio-group v-model:value="form.sourceType">
            <a-radio value="internal">内部自研</a-radio>
            <a-radio value="external">外部平台</a-radio>
          </a-radio-group>
        </a-form-item>

        <template v-if="form.sourceType === 'external'">
          <a-form-item label="来源网址名称" name="sourceUrlName">
            <a-input v-model:value="form.sourceUrlName" placeholder="如 clawhub.ai" :maxlength="100" />
          </a-form-item>
          <a-form-item label="来源网址" name="sourceUrl">
            <a-input v-model:value="form.sourceUrl" placeholder="https://..." />
          </a-form-item>
        </template>

        <a-divider orientation="left">关联与可见范围</a-divider>

        <a-form-item label="关联项目" name="projectIds">
          <a-select
            v-model:value="form.projectIds"
            mode="multiple"
            placeholder="请选择关联项目"
            style="width: 100%"
            :options="projectOptions"
          />
        </a-form-item>

        <a-form-item label="可见范围" name="visibilityType">
          <a-radio-group v-model:value="form.visibilityType">
            <a-radio value="all">全部可见</a-radio>
            <a-radio value="project">按项目成员可见</a-radio>
            <a-radio value="account">指定账号可见</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item v-if="form.visibilityType === 'account'" label="可见账号" name="visibleUserIds">
          <a-select
            v-model:value="form.visibleUserIds"
            mode="multiple"
            placeholder="请选择可见账号"
            style="width: 100%"
            :options="userOptions"
            :filter-option="filterOption"
            show-search
          />
        </a-form-item>

        <a-divider orientation="left">文件上传</a-divider>

        <a-form-item label="Zip包">
          <a-upload
            :file-list="fileList"
            :before-upload="beforeUpload"
            :max-count="1"
            accept=".zip"
            @remove="handleRemove"
          >
            <a-button><UploadOutlined /> 选择Zip文件</a-button>
          </a-upload>
          <div style="color: #8c8c8c; font-size: 12px; margin-top: 4px">仅支持.zip格式，最大50MB</div>
        </a-form-item>

        <a-form-item label="版本号" name="versionNumber">
          <a-input v-model:value="form.versionNumber" placeholder="如 1.0.0" :maxlength="20" />
        </a-form-item>

        <a-form-item label="版本更新说明" name="changeLog">
          <a-textarea v-model:value="form.changeLog" placeholder="请描述本版本的更新内容" :rows="3" />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
          <a-space>
            <a-button type="primary" @click="handleSubmit('pending_review')" :loading="submitting">提交审核</a-button>
            <a-button @click="handleSubmit('draft')" :loading="submitting">保存草稿</a-button>
            <a-button @click="$router.back()">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import type { UploadFile } from 'ant-design-vue'
import { submitSkill, updateSkill, getSkillDetail } from '../../api/skill'
import { getSkillCategories } from '../../api/skill-category'
import { getProjects } from '../../api/project'
import { getUsers } from '../../api/user'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const formRef = ref()
const submitting = ref(false)
const categories = ref<any[]>([])
const projectOptions = ref<any[]>([])
const userOptions = ref<any[]>([])
const fileList = ref<UploadFile[]>([])
const zipFile = ref<File | null>(null)

const form = ref({
  name: '',
  summary: '',
  detail: '',
  author: '',
  categoryId: undefined as number | undefined,
  sourceType: 'internal',
  sourceUrlName: '',
  sourceUrl: '',
  projectIds: [] as number[],
  visibilityType: 'all',
  visibleUserIds: [] as number[],
  changeLog: '',
  versionNumber: '',
  status: 'pending',
})

const rules = {
  name: [{ required: true, message: '请输入Skill名称' }],
  summary: [{ required: true, message: '请输入简介' }],
  detail: [{ required: true, message: '请输入详细说明' }],
  author: [{ required: true, message: '请输入作者' }],
  categoryId: [{ required: true, message: '请选择分类' }],
  sourceType: [{ required: true, message: '请选择来源' }],
  versionNumber: [{ required: true, message: '请输入版本号' }],
  visibilityType: [{ required: true, message: '请选择可见范围' }],
}

onMounted(async () => {
  await Promise.all([loadCategories(), loadProjects(), loadUsers()])
  if (isEdit.value) {
    await loadSkillDetail()
  }
})

async function loadCategories() {
  try {
    const res = await getSkillCategories()
    categories.value = res.data || []
  } catch { /* ignore */ }
}

async function loadProjects() {
  try {
    const res = await getProjects({ page: 1, pageSize: 100 })
    projectOptions.value = (res.data?.list || []).map((p: any) => ({ label: p.name, value: p.id }))
  } catch { /* ignore */ }
}

async function loadUsers() {
  try {
    const res = await getUsers({ page: 1, pageSize: 100 })
    userOptions.value = (res.data?.list || []).map((u: any) => ({ label: `${u.real_name || u.username} (${u.username})`, value: u.id }))
  } catch { /* ignore */ }
}

async function loadSkillDetail() {
  try {
    const res = await getSkillDetail(Number(route.params.id))
    const data = res.data
    form.value = {
      name: data.name,
      summary: data.summary,
      detail: data.detail,
      author: data.author,
      categoryId: data.category_id,
      sourceType: data.source_type,
      sourceUrlName: data.source_url_name || '',
      sourceUrl: data.source_url || '',
      projectIds: data.project_ids || [],
      visibilityType: data.visibility_type,
      visibleUserIds: data.visibility_account_ids || [],
      changeLog: '',
      versionNumber: '',
      status: data.status,
    }
  } catch { /* ignore */ }
}

function beforeUpload(file: File) {
  const isZip = file.name.endsWith('.zip')
  if (!isZip) {
    message.error('仅支持.zip格式文件')
    return false
  }
  const isLt50M = file.size / 1024 / 1024 < 50
  if (!isLt50M) {
    message.error('文件大小不能超过50MB')
    return false
  }
  zipFile.value = file
  fileList.value = [{ uid: '-1', name: file.name, status: 'done' } as UploadFile]
  return false
}

function handleRemove() {
  zipFile.value = null
  fileList.value = []
}

function filterOption(input: string, option: any) {
  return option.label?.toLowerCase().includes(input.toLowerCase())
}

async function handleSubmit(status: string) {
  try {
    await formRef.value?.validateFields()
  } catch {
    return
  }

  if (!isEdit.value && !zipFile.value) {
    message.error('请上传Zip包')
    return
  }

  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('summary', form.value.summary)
    formData.append('detail', form.value.detail)
    formData.append('author', form.value.author)
    formData.append('category_id', String(form.value.categoryId))
    formData.append('source_type', form.value.sourceType)
    if (form.value.sourceUrlName) formData.append('source_url_name', form.value.sourceUrlName)
    if (form.value.sourceUrl) formData.append('source_url', form.value.sourceUrl)
    if (form.value.projectIds && form.value.projectIds.length > 0) {
      formData.append('project_ids', JSON.stringify(form.value.projectIds))
    }
    formData.append('visibility_type', form.value.visibilityType)
    if (form.value.visibilityType === 'account' && form.value.visibleUserIds && form.value.visibleUserIds.length > 0) {
      formData.append('visibility_account_ids', JSON.stringify(form.value.visibleUserIds))
    }
    formData.append('version_number', form.value.versionNumber || '1.0.0')
    if (form.value.changeLog) formData.append('change_log', form.value.changeLog)
    formData.append('status', status)
    if (zipFile.value) {
      formData.append('zipFile', zipFile.value)
    }

    if (isEdit.value) {
      await updateSkill(Number(route.params.id), formData)
      message.success('更新成功')
    } else {
      await submitSkill(formData)
      message.success(status === 'pending_review' ? '已提交审核' : '已保存草稿')
    }
    router.push('/skill/my-submissions')
  } catch {
    message.error('操作失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.skill-submit {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.submit-card {
  border-radius: 12px;
}
</style>
