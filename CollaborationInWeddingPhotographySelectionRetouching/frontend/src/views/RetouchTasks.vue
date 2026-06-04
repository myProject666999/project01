<template>
  <div class="retouch-tasks">
    <el-card class="header-card">
      <div class="tasks-header">
        <h2>修图任务</h2>
        <div class="task-filters">
          <el-select
            v-model="statusFilter"
            placeholder="任务状态"
            clearable
            style="width: 160px"
            @change="fetchTasks"
          >
            <el-option
              v-for="status in taskStatusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
          <el-button type="primary" @click="fetchTasks">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="stats-card">
      <el-row :gutter="20">
        <el-col :span="5">
          <div class="stat-item">
            <div class="stat-number">{{ totalTasks }}</div>
            <div class="stat-label">全部任务</div>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="stat-item pending">
            <div class="stat-number">{{ pendingCount }}</div>
            <div class="stat-label">待领取</div>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="stat-item claimed">
            <div class="stat-number">{{ claimedCount }}</div>
            <div class="stat-label">进行中</div>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="stat-item submitted">
            <div class="stat-number">{{ submittedCount }}</div>
            <div class="stat-label">已提交</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item approved">
            <div class="stat-number">{{ approvedCount }}</div>
            <div class="stat-label">已通过</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="tasks-card">
      <el-table
        v-loading="loading"
        :data="tasks"
        stripe
        style="width: 100%"
      >
        <el-table-column label="照片预览" width="120">
          <template #default="{ row }">
            <el-image
              :src="getPhotoUrl(row.photoId)"
              fit="cover"
              style="width: 80px; height: 60px; border-radius: 4px;"
              :preview-src-list="[getPhotoUrl(row.photoId)]"
            />
          </template>
        </el-table-column>
        <el-table-column prop="id" label="任务ID" width="100" />
        <el-table-column prop="orderId" label="订单ID" width="100" />
        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ getPriorityLabel(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="修图师" width="120">
          <template #default="{ row }">
            {{ row.retoucherName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止时间" width="160">
          <template #default="{ row }">
            {{ row.deadline ? formatDate(row.deadline) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === RetouchTaskStatus.PENDING"
              type="primary"
              size="small"
              @click="claimTask(row.id)"
            >
              领取任务
            </el-button>
            <el-button
              v-if="row.status === RetouchTaskStatus.CLAIMED || row.status === RetouchTaskStatus.IN_PROGRESS"
              type="success"
              size="small"
              @click="showSubmitDialog(row)"
            >
              上传修图
            </el-button>
            <el-button
              v-if="row.status === RetouchTaskStatus.SUBMITTED"
              type="info"
              size="small"
              @click="viewTask(row)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchTasks"
          @current-change="fetchTasks"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="showSubmit"
      title="上传修图"
      width="600px"
    >
      <el-form :model="submitForm" label-width="100px">
        <el-form-item label="当前照片">
          <el-image
            :src="getPhotoUrl(currentTask?.photoId)"
            fit="contain"
            style="width: 100%; max-height: 300px; border-radius: 8px;"
          />
        </el-form-item>
        <el-form-item label="修图文件" required>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            accept="image/*"
            :on-change="handleFileChange"
            :on-exceed="handleExceed"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传一张图片文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input
            v-model="submitForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入修图说明..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSubmit = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitRetouch">
          提交修图
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { usePhotoStore } from '@/stores/photo'
import { RetouchTaskStatus } from '@/types'
import type { RetouchTask } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const photoStore = usePhotoStore()

const loading = computed(() => photoStore.loading)
const tasks = computed(() => photoStore.retouchTasks)
const total = computed(() => photoStore.total)

const statusFilter = ref<RetouchTaskStatus | ''>('')
const showSubmit = ref(false)
const submitting = ref(false)
const currentTask = ref<RetouchTask | null>(null)
const uploadRef = ref()
const selectedFile = ref<File | null>(null)

const pagination = reactive({
  page: 1,
  pageSize: 10
})

const submitForm = reactive({
  remarks: ''
})

const taskStatusOptions = [
  { value: RetouchTaskStatus.PENDING, label: '待领取' },
  { value: RetouchTaskStatus.CLAIMED, label: '已领取' },
  { value: RetouchTaskStatus.IN_PROGRESS, label: '进行中' },
  { value: RetouchTaskStatus.SUBMITTED, label: '已提交' },
  { value: RetouchTaskStatus.APPROVED, label: '已通过' },
  { value: RetouchTaskStatus.REJECTED, label: '已驳回' }
]

const totalTasks = computed(() => total.value)
const pendingCount = computed(() => tasks.value.filter(t => t.status === RetouchTaskStatus.PENDING).length)
const claimedCount = computed(() => tasks.value.filter(t => t.status === RetouchTaskStatus.CLAIMED || t.status === RetouchTaskStatus.IN_PROGRESS).length)
const submittedCount = computed(() => tasks.value.filter(t => t.status === RetouchTaskStatus.SUBMITTED).length)
const approvedCount = computed(() => tasks.value.filter(t => t.status === RetouchTaskStatus.APPROVED).length)

const getPriorityType = (priority: number) => {
  if (priority >= 8) return 'danger'
  if (priority >= 5) return 'warning'
  return 'info'
}

const getPriorityLabel = (priority: number) => {
  if (priority >= 8) return '高'
  if (priority >= 5) return '中'
  return '低'
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    [RetouchTaskStatus.PENDING]: 'info',
    [RetouchTaskStatus.CLAIMED]: 'primary',
    [RetouchTaskStatus.IN_PROGRESS]: 'warning',
    [RetouchTaskStatus.SUBMITTED]: 'warning',
    [RetouchTaskStatus.APPROVED]: 'success',
    [RetouchTaskStatus.REJECTED]: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    [RetouchTaskStatus.PENDING]: '待领取',
    [RetouchTaskStatus.CLAIMED]: '已领取',
    [RetouchTaskStatus.IN_PROGRESS]: '进行中',
    [RetouchTaskStatus.SUBMITTED]: '已提交',
    [RetouchTaskStatus.APPROVED]: '已通过',
    [RetouchTaskStatus.REJECTED]: '已驳回'
  }
  return labelMap[status] || status
}

const getPhotoUrl = (photoId: number) => {
  return `https://picsum.photos/400/300?random=${photoId}`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const fetchTasks = async () => {
  await photoStore.fetchRetouchTasks({
    page: pagination.page,
    pageSize: pagination.pageSize,
    status: statusFilter.value || undefined
  })
}

const claimTask = async (taskId: number) => {
  try {
    await ElMessageBox.confirm(
      '确认领取此任务？领取后请在规定时间内完成修图。',
      '领取任务确认',
      {
        confirmButtonText: '确认领取',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await photoStore.claimTask(taskId)
    await fetchTasks()
  } catch {
  }
}

const showSubmitDialog = (task: RetouchTask) => {
  currentTask.value = task
  submitForm.remarks = ''
  selectedFile.value = null
  showSubmit.value = true
}

const handleFileChange = (file: any) => {
  selectedFile.value = file.raw
}

const handleExceed = () => {
  ElMessage.warning('只能上传一张图片')
}

const submitRetouch = async () => {
  if (!currentTask.value) return
  if (!selectedFile.value) {
    ElMessage.warning('请选择修图文件')
    return
  }

  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    if (submitForm.remarks) {
      formData.append('remarks', submitForm.remarks)
    }
    
    await photoStore.submitRetouch(currentTask.value.id, formData)
    showSubmit.value = false
    await fetchTasks()
  } finally {
    submitting.value = false
  }
}

const viewTask = (task: RetouchTask) => {
  console.log('View task:', task)
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.retouch-tasks {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tasks-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.task-filters {
  display: flex;
  gap: 12px;
}

.stats-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: #f5f7fa;
}

.stat-item.pending {
  background: #f4f4f5;
}

.stat-item.claimed {
  background: #ecf5ff;
}

.stat-item.submitted {
  background: #fdf6ec;
}

.stat-item.approved {
  background: #f0f9eb;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.tasks-card :deep(.el-card__body) {
  padding: 0;
}

.pagination-wrapper {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
