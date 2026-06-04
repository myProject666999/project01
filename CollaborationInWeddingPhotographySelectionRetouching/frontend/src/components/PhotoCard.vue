<template>
  <div
    class="photo-card"
    :class="{
      selected: photo.isSelected,
      'must-select': photo.rating === 5,
      'alternative': photo.rating === 3,
      rejected: photo.rating === 1
    }"
  >
    <div class="photo-wrapper" @click="$emit('click', photo)">
      <el-image
        :src="photo.thumbnailUrl || photo.originalUrl"
        :preview-src-list="[photo.originalUrl]"
        fit="cover"
        class="photo-image"
        @click.stop
      />
      <div class="photo-overlay">
        <el-checkbox
          v-model="isSelected"
          @change="handleSelectionChange"
          class="photo-checkbox"
        />
      </div>
      <div v-if="photo.isSelected" class="selected-badge">
        <el-icon><Check /></el-icon>
      </div>
    </div>
    <div class="photo-info">
      <div class="photo-name" :title="photo.fileName">
        {{ photo.fileName }}
      </div>
      <div class="photo-rating">
        <StarRating
          :model-value="photo.rating"
          @change="handleRatingChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check } from '@element-plus/icons-vue'
import type { Photo } from '@/types'
import StarRating from './StarRating.vue'

interface Props {
  photo: Photo
}

interface Emits {
  (e: 'click', photo: Photo): void
  (e: 'select', photo: Photo, selected: boolean): void
  (e: 'rate', photo: Photo, rating: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isSelected = computed({
  get: () => props.photo.isSelected,
  set: (value: boolean) => emit('select', props.photo, value)
})

const handleSelectionChange = (value: boolean) => {
  emit('select', props.photo, value)
}

const handleRatingChange = (rating: number) => {
  emit('rate', props.photo, rating)
}
</script>

<style scoped>
.photo-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.photo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.photo-card.selected {
  box-shadow: 0 0 0 3px #409eff;
}

.photo-card.must-select {
  box-shadow: 0 0 0 3px #67c23a;
}

.photo-card.alternative {
  box-shadow: 0 0 0 3px #e6a23c;
}

.photo-card.rejected {
  opacity: 0.5;
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

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 12px;
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

.photo-checkbox {
  transform: scale(1.2);
}

.selected-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.photo-card.must-select .selected-badge {
  background: #67c23a;
}

.photo-card.alternative .selected-badge {
  background: #e6a23c;
}

.photo-info {
  padding: 12px;
}

.photo-name {
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 8px;
}

.photo-rating {
  display: flex;
  justify-content: center;
}
</style>
