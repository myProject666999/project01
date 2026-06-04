<template>
  <div class="photo-selection">
    <el-card class="header-card">
      <div class="selection-header">
        <div class="order-info">
          <h2>照片选片</h2>
          <el-select
            v-model="selectedOrderId"
            placeholder="选择订单"
            style="width: 280px"
            @change="handleOrderChange"
          >
            <el-option
              v-for="order in orders"
              :key="order.id"
              :label="`${order.orderNo} - ${order.coupleName}`"
              :value="order.id"
            />
          </el-select>
        </div>
        <div class="selection-actions">
          <div class="filter-tabs">
            <el-radio-group v-model="filterType" @change="handleFilterChange">
              <el-radio-button value="all">全部</el-radio-button>
              <el-radio-button value="selected">已选</el-radio-button>
              <el-radio-button value="must">五星必选</el-radio-button>
              <el-radio-button value="alternative">三星备选</el-radio-button>
              <el-radio-button value="rejected">一星不要</el-radio-button>
            </el-radio-group>
          </div>
          <el-button type="success" @click="submitSelection" :disabled="selectedCount === 0">
            <el-icon><Check /></el-icon>
            提交选片 ({{ selectedCount }}/{{ orderTotalPhotos }})
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <el-icon :size="28" class="stat-icon all"><Picture /></el-icon>
            <div class="stat-content">
              <div class="stat-number">{{ totalPhotos }}</div>
              <div class="stat-label">全部照片</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <el-icon :size="28" class="stat-icon must"><Star /></el-icon>
            <div class="stat-content">
              <div class="stat-number">{{ mustSelectCount }}</div>
              <div class="stat-label">五星必选</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <el-icon :size="28" class="stat-icon alternative"><StarFilled /></el-icon>
            <div class="stat-content">
              <div class="stat-number">{{ alternativeCount }}</div>
              <div class="stat-label">三星备选</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <el-icon :size="28" class="stat-icon rejected"><Close /></el-icon>
            <div class="stat-content">
              <div class="stat-number">{{ rejectedCount }}</div>
              <div class="stat-label">一星不要</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="photos-card">
      <div class="photos-toolbar">
        <span class="photo-count">共 {{ filteredPhotos.length }} 张照片</span>
      </div>
      <div v-loading="loading" class="photos-grid">
        <PhotoCard
          v-for="photo in filteredPhotos"
          :key="photo.id"
          :photo="photo"
          @click="handlePhotoClick"
          @select="handlePhotoSelect"
          @rate="handlePhotoRate"
        />
      </div>
      <el-empty v-if="!loading && !filteredPhotos.length" description="暂无照片" />
    </el-card>

    <PhotoViewer
      v-model="viewerVisible"
      :photo="currentPhoto"
      :comments="comments"
      @rate="handleViewerRate"
      @select="handleViewerSelect"
      @add-comment="handleAddComment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Picture, Star, StarFilled, Close, Check } from '@element-plus/icons-vue'
import { usePhotoStore } from '@/stores/photo'
import { useOrderStore } from '@/stores/order'
import PhotoCard from '@/components/PhotoCard.vue'
import PhotoViewer from '@/components/PhotoViewer.vue'
import type { Photo } from '@/types'
import { PhotoRating, OrderStatus } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const photoStore = usePhotoStore()
const orderStore = useOrderStore()

const selectedOrderId = ref<number | null>(null)
const filterType = ref('all')
const viewerVisible = ref(false)
const currentPhoto = ref<Photo | null>(null)

const loading = computed(() => photoStore.loading)
const photos = computed(() => photoStore.photos)
const orders = computed(() => orderStore.orders)
const comments = computed(() => photoStore.comments)

const orderTotalPhotos = computed(() => {
  const order = orders.value.find(o => o.id === selectedOrderId.value)
  return order?.totalPhotos || 0
})

const totalPhotos = computed(() => photos.value.length)
const selectedCount = computed(() => photoStore.selectedPhotos.length)
const mustSelectCount = computed(() => photoStore.mustSelectPhotos.length)
const alternativeCount = computed(() => photoStore.alternativePhotos.length)
const rejectedCount = computed(() => photoStore.rejectedPhotos.length)

const filteredPhotos = computed(() => {
  switch (filterType.value) {
    case 'selected':
      return photos.value.filter(p => p.isSelected)
    case 'must':
      return photos.value.filter(p => p.rating === PhotoRating.MUST_SELECT)
    case 'alternative':
      return photos.value.filter(p => p.rating === PhotoRating.ALTERNATIVE)
    case 'rejected':
      return photos.value.filter(p => p.rating === PhotoRating.REJECTED)
    default:
      return photos.value
  }
})

const handleOrderChange = async () => {
  if (selectedOrderId.value) {
    await photoStore.fetchPhotos(selectedOrderId.value)
  }
}

const handleFilterChange = () => {}

const handlePhotoClick = (photo: Photo) => {
  currentPhoto.value = photo
  viewerVisible.value = true
  photoStore.fetchComments(photo.id)
}

const handlePhotoSelect = async (photo: Photo, selected: boolean) => {
  await photoStore.togglePhotoSelection(photo.id)
}

const handlePhotoRate = async (photo: Photo, rating: number) => {
  await photoStore.ratePhoto(photo.id, rating as PhotoRating)
}

const handleViewerRate = async (rating: number) => {
  if (currentPhoto.value) {
    await photoStore.ratePhoto(currentPhoto.value.id, rating as PhotoRating)
  }
}

const handleViewerSelect = async (selected: boolean) => {
  if (currentPhoto.value) {
    await photoStore.togglePhotoSelection(currentPhoto.value.id)
  }
}

const handleAddComment = async (content: string) => {
  if (currentPhoto.value) {
    await photoStore.addComment(currentPhoto.value.id, content)
  }
}

const submitSelection = async () => {
  if (!selectedOrderId.value) return
  
  try {
    await ElMessageBox.confirm(
      `确认提交选片？已选择 ${selectedCount.value} 张照片。提交后将进入修图流程。`,
      '提交选片确认',
      {
        confirmButtonText: '确认提交',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await orderStore.submitSelection(selectedOrderId.value)
    ElMessage.success('选片已提交，等待修图师处理')
  } catch {
  }
}

onMounted(async () => {
  await orderStore.fetchOrders({ page: 1, pageSize: 100 })
  
  const orderIdFromQuery = route.query.orderId
  if (orderIdFromQuery) {
    selectedOrderId.value = Number(orderIdFromQuery)
    await handleOrderChange()
  }
})

watch(selectedOrderId, (newVal) => {
  if (newVal) {
    handleOrderChange()
  }
})
</script>

<style scoped>
.photo-selection {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.order-info h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: #f5f7fa;
}

.stat-icon.all {
  color: #409eff;
}

.stat-icon.must {
  color: #67c23a;
}

.stat-icon.alternative {
  color: #e6a23c;
}

.stat-icon.rejected {
  color: #f56c6c;
}

.stat-number {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.photos-card :deep(.el-card__body) {
  padding: 0;
}

.photos-toolbar {
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
}

.photo-count {
  font-size: 14px;
  color: #606266;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px;
}
</style>
