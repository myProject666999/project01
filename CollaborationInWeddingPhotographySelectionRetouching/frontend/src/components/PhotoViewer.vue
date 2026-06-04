<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="90%"
    :close-on-click-modal="false"
    class="photo-viewer-dialog"
    @close="handleClose"
  >
    <div class="photo-viewer-content">
      <div class="photo-display">
        <el-image
          :src="photo?.originalUrl"
          fit="contain"
          class="main-photo"
          :preview-src-list="[photo?.originalUrl || '']"
          :initial-index="0"
        />
        <div class="photo-actions">
          <div class="rating-section">
            <span class="label">评分：</span>
            <StarRating
              :model-value="photo?.rating || 0"
              @change="handleRatingChange"
            />
          </div>
          <el-checkbox v-model="isSelected" @change="handleSelectionChange">
            选中此照片
          </el-checkbox>
        </div>
      </div>
      <div class="comments-section">
        <h4>评论区</h4>
        <div class="comments-list">
          <el-empty v-if="!comments.length" description="暂无评论" />
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-header">
              <el-avatar :size="32">
                {{ comment.userName?.charAt(0) }}
              </el-avatar>
              <div class="comment-info">
                <span class="user-name">{{ comment.userName }}</span>
                <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
              </div>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
        </div>
        <div class="comment-input">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="输入评论..."
            @keydown.enter.ctrl="submitComment"
          />
          <div class="comment-actions">
            <el-button type="primary" :loading="submitting" @click="submitComment">
              发送评论
            </el-button>
            <span class="tip">按 Ctrl+Enter 发送</span>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Photo, PhotoComment } from '@/types'
import StarRating from './StarRating.vue'

interface Props {
  modelValue: boolean
  photo: Photo | null
  comments: PhotoComment[]
  title?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'rate', rating: number): void
  (e: 'select', selected: boolean): void
  (e: 'add-comment', content: string): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '照片查看'
})

const emit = defineEmits<Emits>()

const visible = ref(props.modelValue)
const isSelected = ref(false)
const newComment = ref('')
const submitting = ref(false)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

watch(() => props.photo, (photo) => {
  isSelected.value = photo?.isSelected || false
})

const handleClose = () => {
  emit('close')
}

const handleRatingChange = (rating: number) => {
  emit('rate', rating)
}

const handleSelectionChange = (selected: boolean) => {
  emit('select', selected)
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  submitting.value = true
  try {
    emit('add-comment', newComment.value.trim())
    newComment.value = ''
  } finally {
    submitting.value = false
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}
</script>

<style scoped>
.photo-viewer-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.photo-viewer-content {
  display: flex;
  height: 70vh;
  min-height: 500px;
}

.photo-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-right: 1px solid #ebeef5;
}

.main-photo {
  flex: 1;
  width: 100%;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.photo-actions {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-section .label {
  color: #606266;
  font-size: 14px;
}

.comments-section {
  width: 320px;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.comments-section h4 {
  padding: 16px 20px;
  margin: 0;
  border-bottom: 1px solid #ebeef5;
  background: #fff;
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.comment-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.comment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  word-break: break-word;
}

.comment-input {
  padding: 12px;
  border-top: 1px solid #ebeef5;
  background: #fff;
}

.comment-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.comment-actions .tip {
  font-size: 12px;
  color: #c0c4cc;
}
</style>
