<template>
  <div class="review-retouch">
    <el-card class="header-card">
      <div class="review-header">
        <div class="title-section">
          <h2>修图验收</h2>
          <el-select
            v-model="selectedOrderId"
            placeholder="选择订单"
            style="width: 280px"
            @change="handleOrderChange"
          >
            <el-option
              v-for="order in reviewingOrders"
              :key="order.id"
              :label="`${order.orderNo} - ${order.coupleName}`"
              :value="order.id"
            />
          </el-select>
        </div>
        <div class="retouch-info" v-if="currentOrder">
          <el-alert
            :title="`剩余返工次数：${currentOrder.remainingRetouchCount} / ${currentOrder.maxRetouchCount}`"
            type="warning"
            :closable="false"
            style="max-width: 300px"
          />
        </div>
      </div>
    </el-card>

    <el-card class="tasks-card">
      <div class="tasks-header">
        <span>待验收照片列表</span>
        <el-tag type="primary">共 {{ reviewTasks.length }} 张</el-tag>
      </div>
      <div v-loading="loading" class="photos-grid">
        <div
          v-for="task in reviewTasks"
          :key="task.id"
          class="photo-item"
          @click="handlePhotoClick(task)"
        >
          <div class="photo-wrapper">
            <el-image
              :src="getPhotoUrl(task.photoId)"
              fit="cover"
              class="photo-image"
            />
            <div class="photo-badge">
              <el-tag size="small" :type="getTaskStatusType(task.status)">
                {{ getTaskStatusLabel(task.status) }}
              </el-tag>
            </div>
            <div class="photo-overlay">
              <el-icon :size="32"><ZoomIn /></el-icon>
            </div>
          </div>
          <div class="photo-info">
            <span class="photo-name">照片 #{{ task.photoId }}</span>
            <span class="version-info">v{{ getLatestVersion(task.photoId) }}</span>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && !reviewTasks.length" description="暂无待验收的修图" />
    </el-card>

    <el-dialog
      v-model="showReview"
      title="修图验收"
      width="90%"
      class="review-dialog"
      :close-on-click-modal="false"
    >
      <div class="review-content" v-if="currentTask">
        <div class="compare-section">
          <div class="compare-item">
            <h4>原图</h4>
            <el-image
              :src="getPhotoUrl(currentTask.photoId)"
              fit="contain"
              class="compare-image"
              :preview-src-list="[getPhotoUrl(currentTask.photoId)]"
            />
          </div>
          <div class="compare-divider">
            <el-icon :size="28"><Right /></el-icon>
          </div>
          <div class="compare-item">
            <h4>修图后 (v{{ getLatestVersion(currentTask.photoId) }})</h4>
            <el-image
              :src="getPhotoUrl(currentTask.photoId + 1000)"
              fit="contain"
              class="compare-image"
              :preview-src-list="[getPhotoUrl(currentTask.photoId + 1000)]"
            />
          </div>
        </div>

        <div class="versions-section">
          <h4>版本历史</h4>
          <el-timeline>
            <el-timeline-item
              v-for="version in getVersions(currentTask.photoId)"
              :key="version.id"
              :timestamp="formatDate(version.createdAt)"
              placement="top"
            >
              <div class="version-item">
                <el-tag type="success" size="small">v{{ version.version }}</el-tag>
                <span v-if="version.remarks" class="version-remarks">{{ version.remarks }}</span>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="action-section">
          <el-form :model="rejectForm" label-width="100px">
            <el-form-item label="驳回原因" v-if="showRejectForm">
              <el-input
                v-model="rejectForm.reason"
                type="textarea"
                :rows="3"
                placeholder="请输入驳回原因，帮助修图师了解修改需求..."
              />
            </el-form-item>
          </el-form>
          <div class="action-buttons" v-if="currentTask.status === RetouchTaskStatus.SUBMITTED">
            <el-button
              v-if="!showRejectForm"
              type="danger"
              size="large"
              :disabled="remainingCount <= 0"
              @click="showRejectForm = true"
            >
              <el-icon><Close /></el-icon>
              驳回重做 (剩余{{ remainingCount }}次)
            </el-button>
            <template v-if="showRejectForm">
              <el-button size="large" @click="showRejectForm = false">
                取消
              </el-button>
              <el-button
                type="danger"
                size="large"
                :loading="submitting"
                :disabled="!rejectForm.reason.trim()"
                @click="handleReject"
              >
                确认驳回
              </el-button>
            </template>
            <el-button
              type="success"
              size="large"
              :loading="submitting"
              @click="handleApprove"
            >
              <el-icon><Check /></el-icon>
              通过验收
            </el-button>
          </div>
          <el-alert
            v-else
            :title="getReviewResult(currentTask.status)"
            :type="currentTask.status === RetouchTaskStatus.APPROVED ? 'success' : 'warning'"
            :closable="false"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ZoomIn, Right, Check, Close } from '@element-plus/icons-vue'
import { useOrderStore } from '@/stores/order'
import { usePhotoStore } from '@/stores/photo'
import { RetouchTaskStatus, OrderStatus } from '@/types'
import type { RetouchTask } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const orderStore = useOrderStore()
const photoStore = usePhotoStore()

const loading = computed(() => orderStore.loading || photoStore.loading)
const orders = computed(() => orderStore.orders)
const tasks = computed(() => photoStore.retouchTasks)
const versions = computed(() => photoStore.retouchVersions)

const selectedOrderId = ref<number | null>(null)
const showReview = ref(false)
const currentTask = ref<RetouchTask | null>(null)
const showRejectForm = ref(false)
const submitting = ref(false)

const rejectForm = reactive({
  reason: ''
})

const reviewingOrders = computed(() => {
  return orders.value.filter(o => 
    o.status === OrderStatus.REVIEWING || o.status === OrderStatus.RETOUCHING
  )
})

const currentOrder = computed(() => {
  return orders.value.find(o => o.id === selectedOrderId.value) || null
})

const remainingCount = computed(() => {
  return currentOrder.value?.remainingRetouchCount || 0
})

const reviewTasks = computed(() => {
  if (!selectedOrderId.value) return []
  return tasks.value.filter(t => 
    t.orderId === selectedOrderId.value && 
    (t.status === RetouchTaskStatus.SUBMITTED || 
     t.status === RetouchTaskStatus.APPROVED ||
     t.status === RetouchTaskStatus.REJECTED)
  )
})

const getTaskStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    [RetouchTaskStatus.SUBMITTED]: 'warning',
    [RetouchTaskStatus.APPROVED]: 'success',
    [RetouchTaskStatus.REJECTED]: 'danger'
  }
  return typeMap[status] || 'info'
}

const getTaskStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    [RetouchTaskStatus.SUBMITTED]: '待验收',
    [RetouchTaskStatus.APPROVED]: '已通过',
    [RetouchTaskStatus.REJECTED]: '已驳回'
  }
  return labelMap[status] || status
}

const getPhotoUrl = (photoId: number) => {
  return `https://picsum.photos/800/600?random=${photoId}`
}

const getLatestVersion = (photoId: number) => {
  const photoVersions = versions.value.filter(v => v.photoId === photoId)
  return photoVersions.length > 0 ? Math.max(...photoVersions.map(v => v.version)) : 1
}

const getVersions = (photoId: number) => {
  return versions.value.filter(v => v.photoId === photoId).sort((a, b) => b.version - a.version)
}

const getReviewResult = (status: string) => {
  if (status === RetouchTaskStatus.APPROVED) {
    return '该照片已通过验收'
  } else if (status === RetouchTaskStatus.REJECTED) {
    return '该照片已驳回，修图师正在重新修改'
  }
  return ''
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

const handleOrderChange = async () => {
  if (selectedOrderId.value) {
    await photoStore.fetchRetouchTasks({
      page: 1,
      pageSize: 100
    })
  }
}

const handlePhotoClick = async (task: RetouchTask) => {
  currentTask.value = task
  showRejectForm.value = false
  rejectForm.reason = ''
  await photoStore.fetchRetouchVersions(task.photoId)
  showReview.value = true
}

const handleApprove = async () => {
  if (!currentTask.value) return
  
  try {
    await ElMessageBox.confirm(
      '确认通过此照片的修图验收？通过后将无法再要求返工。',
      '验收确认',
      {
        confirmButtonText: '确认通过',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
    
    submitting.value = true
    await photoStore.approveRetouch(currentTask.value.id)
    showReview.value = false
    await handleOrderChange()
  } catch {
  } finally {
    submitting.value = false
  }
}

const handleReject = async () => {
  if (!currentTask.value || !rejectForm.reason.trim()) return
  
  try {
    await ElMessageBox.confirm(
      '确认驳回此照片？将消耗一次返工次数。',
      '驳回确认',
      {
        confirmButtonText: '确认驳回',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    submitting.value = true
    await photoStore.rejectRetouch(currentTask.value.id, rejectForm.reason.trim())
    showReview.value = false
    await handleOrderChange()
  } catch {
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await orderStore.fetchOrders({ page: 1, pageSize: 100 })
  
  if (reviewingOrders.value.length > 0) {
    selectedOrderId.value = reviewingOrders.value[0].id
    await handleOrderChange()
  }
})
</script>

<style scoped>
.review-retouch {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.title-section h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.tasks-card :deep(.el-card__body) {
  padding: 0;
}

.tasks-header {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px;
}

.photo-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.photo-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.photo-wrapper {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
}

.photo-item:hover .photo-overlay {
  opacity: 1;
}

.photo-info {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.photo-name {
  font-size: 13px;
  color: #303133;
}

.version-info {
  font-size: 12px;
  color: #909399;
}

.review-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.review-content {
  padding: 20px;
}

.compare-section {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.compare-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.compare-item h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  text-align: center;
}

.compare-image {
  width: 100%;
  height: 400px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.compare-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.versions-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.versions-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.version-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.version-remarks {
  font-size: 14px;
  color: #606266;
}

.action-section {
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}
</style>
