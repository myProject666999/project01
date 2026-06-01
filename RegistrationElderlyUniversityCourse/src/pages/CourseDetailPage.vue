<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get, post } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import type { Course, Enrollment } from '@/lib/types'
import { Users, Clock, MapPin, ArrowLeft, BookOpen } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { isLoggedIn } = useAuth()

const course = ref<Course | null>(null)
const enrolled = ref(false)
const loading = ref(true)
const enrolling = ref(false)

const courseId = computed(() => Number(route.params.id))

const remaining = computed(() => {
  if (!course.value) return 0
  return course.value.capacity - course.value.enrolled_count
})

const imageUrl = computed(() => {
  if (!course.value) return ''
  const prompts: Record<string, string> = {
    '书画': 'Chinese%20calligraphy%20painting%20class%20elderly%20warm%20colors',
    '声乐': 'singing%20class%20elderly%20warm%20classroom',
    '舞蹈': 'dance%20class%20elderly%20graceful%20movements',
    '手工': 'handicraft%20class%20elderly%20colorful%20art',
  }
  const prompt = prompts[course.value.category] || 'elderly%20university%20class'
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=landscape_16_9`
})

onMounted(async () => {
  await Promise.all([fetchCourse(), checkEnrollment()])
})

async function fetchCourse() {
  try {
    const res = await get<Course>(`/courses/${courseId.value}`)
    if (res.code === 0) course.value = res.data
  } catch { /* */ } finally {
    loading.value = false
  }
}

async function checkEnrollment() {
  if (!isLoggedIn.value) return
  try {
    const res = await get<Enrollment[]>('/enrollments/my')
    if (res.code === 0) {
      enrolled.value = res.data.some(e => e.course_id === courseId.value)
    }
  } catch { /* */ }
}

async function handleEnroll() {
  if (!isLoggedIn.value) {
    router.push({ name: 'login', query: { redirect: `/courses/${courseId.value}` } })
    return
  }
  enrolling.value = true
  try {
    const res = await post('/enrollments', { course_id: courseId.value })
    if (res.code === 0) {
      enrolled.value = true
      if (course.value) course.value.enrolled_count++
    } else {
      alert(res.message || '报名失败')
    }
  } catch {
    alert('报名失败，请稍后重试')
  } finally {
    enrolling.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-4">
    <button @click="router.back()" class="flex items-center gap-2 text-secondary mb-4 py-2">
      <ArrowLeft class="w-6 h-6" />
      <span class="text-lg">返回</span>
    </button>

    <div v-if="loading" class="text-center py-12 text-secondary-light text-xl">加载中...</div>
    <div v-else-if="!course" class="text-center py-12 text-secondary-light text-xl">课程不存在</div>
    <template v-else>
      <div class="bg-white rounded-xl2 shadow-md overflow-hidden mb-4">
        <img :src="imageUrl" :alt="course.name" class="w-full h-48 object-cover" />
        <div class="p-5">
          <h1 class="text-xl4 font-bold text-secondary mb-3">{{ course.name }}</h1>
          <div class="flex flex-col gap-2 text-lg text-secondary-light mb-4">
            <div class="flex items-center gap-2">
              <Users class="w-5 h-5 text-primary" />
              <span>授课老师：<b class="text-secondary">{{ course.teacher }}</b></span>
            </div>
            <div class="flex items-center gap-2">
              <Clock class="w-5 h-5 text-primary" />
              <span>上课时间：{{ course.schedule_day }} {{ course.schedule_time }}</span>
            </div>
            <div class="flex items-center gap-2">
              <MapPin class="w-5 h-5 text-primary" />
              <span>教室：{{ course.classroom }}</span>
            </div>
            <div class="flex items-center gap-2">
              <BookOpen class="w-5 h-5 text-primary" />
              <span>分类：{{ course.category }}</span>
            </div>
          </div>

          <div v-if="course.description" class="mb-4">
            <h3 class="text-xl font-bold text-secondary mb-2">课程介绍</h3>
            <p class="text-base text-secondary-light leading-relaxed">{{ course.description }}</p>
          </div>

          <div class="flex items-center justify-between p-4 bg-cream rounded-xl2">
            <span class="text-xl font-bold" :class="remaining <= 0 ? 'text-gray-400' : remaining <= 5 ? 'text-red-500' : 'text-primary'">
              {{ remaining <= 0 ? '已满员' : `剩余 ${remaining} 个名额` }}
            </span>
            <span class="text-base text-secondary-light">
              {{ course.enrolled_count }}/{{ course.capacity }} 人
            </span>
          </div>
        </div>
      </div>

      <button
        v-if="enrolled"
        disabled
        class="w-full py-4 rounded-xl2 text-xl font-bold bg-green-100 text-green-700"
      >
        已报名
      </button>
      <button
        v-else
        @click="handleEnroll"
        :disabled="remaining <= 0 || enrolling"
        class="w-full py-4 rounded-xl2 text-xl font-bold text-white transition-all active:scale-[0.98]"
        :class="remaining <= 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg'"
      >
        {{ enrolling ? '报名中...' : remaining <= 0 ? '已满员' : '立即报名' }}
      </button>
    </template>
  </div>
</template>
