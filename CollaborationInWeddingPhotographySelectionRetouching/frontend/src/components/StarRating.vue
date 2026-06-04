<template>
  <div class="star-rating">
    <el-tooltip
      v-for="(rating, index) in ratingOptions"
      :key="rating.value"
      :content="rating.label"
      placement="top"
    >
      <el-icon
        :class="[
          'star-icon',
          { active: modelValue >= rating.value },
          { 'must-select': rating.value === 5 && modelValue >= 5 },
          { 'alternative': rating.value === 3 && modelValue === 3 },
          { 'rejected': rating.value === 1 && modelValue === 1 },
          { clickable: readonly === false }
        ]"
        @click="handleRate(rating.value)"
      >
        <Star v-if="modelValue >= rating.value" />
        <Star v-else :style="{ color: '#dcdfe6' }" />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { Star } from '@element-plus/icons-vue'
import { PhotoRating } from '@/types'

interface Props {
  modelValue: number
  readonly?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const emit = defineEmits<Emits>()

const ratingOptions = [
  { value: PhotoRating.REJECTED, label: '一星 - 不要' },
  { value: PhotoRating.ALTERNATIVE, label: '三星 - 备选' },
  { value: PhotoRating.MUST_SELECT, label: '五星 - 必选' }
]

const handleRate = (value: number) => {
  if (props.readonly) return
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.star-icon {
  font-size: 20px;
  cursor: default;
  transition: transform 0.2s;
}

.star-icon.clickable {
  cursor: pointer;
}

.star-icon.clickable:hover {
  transform: scale(1.2);
}

.star-icon.active {
  color: #f7ba2a;
}

.star-icon.must-select {
  color: #67c23a;
}

.star-icon.alternative {
  color: #e6a23c;
}

.star-icon.rejected {
  color: #f56c6c;
}
</style>
