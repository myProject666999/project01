<script setup lang="ts">
import { computed } from 'vue'
import { Users, MapPin, Clock } from 'lucide-vue-next'
import type { Course } from '@/lib/types'

const props = defineProps<{
  course: Course
  enrolled?: boolean
  waitlisted?: boolean
}>()

const emit = defineEmits<{
  enroll: [courseId: number]
}>()

const remaining = computed(() => props.course.capacity - props.course.enrolled_count)
const isLow = computed(() => remaining.value <= 5 && remaining.value > 0)
const isFull = computed(() => remaining.value <= 0)

const imageUrl = computed(() => {
  const prompts: Record<string, string> = {
    '书画': 'Chinese%20calligraphy%20painting%20class%20elderly%20students%20warm%20colors',
    '声乐': 'singing%20class%20elderly%20people%20microphone%20warm%20classroom',
    '舞蹈': 'dance%20class%20elderly%20people%20graceful%20movements%20bright%20room',
    '手工': 'handicraft%20class%20elderly%20people%20crafting%20colorful%20art',
  }
  const prompt = prompts[props.course.category] || 'elderly%20university%20class%20warm%20classroom'
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=landscape_16_9`
})

function handleEnroll() {
  emit('enroll', props.course.id)
}
</script>

<template>
  <div class="bg-white rounded-xl2 shadow-md overflow-hidden">
    <div class="flex flex-col sm:flex-row">
      <div class="sm:w-2/5 h-40 sm:h-auto bg-cream-dark flex-shrink-0">
        <img :src="imageUrl" :alt="course.name" class="w-full h-full object-cover" loading="lazy" />
      </div>
      <div class="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-xl3 font-bold text-secondary">{{ course.name }}</h3>
            <span v-if="enrolled" class="bg-green-100 text-green-700 text-sm px-2 py-0.5 rounded-lg font-bold">已报名</span>
            <span v-else-if="waitlisted" class="bg-yellow-100 text-yellow-700 text-sm px-2 py-0.5 rounded-lg font-bold">候补中</span>
          </div>
          <div class="flex flex-col gap-1 text-secondary-light">
            <div class="flex items-center gap-2">
              <Users class="w-4 h-4" />
              <span>{{ course.teacher }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="w-4 h-4" />
              <span>{{ course.schedule_day }} {{ course.schedule_time }}</span>
            </div>
            <div class="flex items-center gap-2">
              <MapPin class="w-4 h-4" />
              <span>{{ course.classroom }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between mt-3">
          <span
            class="text-xl font-bold"
            :class="isFull ? 'text-gray-400' : isLow ? 'text-red-500' : 'text-primary'"
          >
            {{ isFull ? '已满员' : `剩余 ${remaining} 个名额` }}
          </span>
          <button
            v-if="!enrolled && !waitlisted"
            @click="handleEnroll"
            :disabled="isFull"
            class="px-6 py-3 rounded-xl2 text-white text-xl font-bold transition-all active:scale-95"
            :class="isFull ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg'"
          >
            {{ isFull ? '已满' : '立即报名' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
