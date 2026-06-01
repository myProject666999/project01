<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get, post } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import type { Course, Enrollment } from '@/lib/types'
import CourseCard from '@/components/CourseCard.vue'
import Empty from '@/components/Empty.vue'
import { X } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { isLoggedIn } = useAuth()

const categories = ['全部', '书画', '声乐', '舞蹈', '手工']
const activeCategory = ref('全部')
const courses = ref<Course[]>([])
const enrollments = ref<Enrollment[]>([])
const loading = ref(true)
const showConfirm = ref(false)
const selectedCourse = ref<Course | null>(null)
const enrolling = ref(false)

const enrolledIds = computed(() => new Set(enrollments.value.map(e => e.course_id)))

const filteredCourses = computed(() => {
  if (activeCategory.value === '全部') return courses.value
  return courses.value.filter(c => c.category === activeCategory.value)
})

onMounted(async () => {
  const cat = route.query.category as string
  if (cat && categories.includes(cat)) {
    activeCategory.value = cat
  }
  await Promise.all([fetchCourses(), fetchEnrollments()])
})

watch(() => route.query.category, (cat) => {
  if (cat && categories.includes(cat as string)) {
    activeCategory.value = cat as string
  }
})

async function fetchCourses() {
  try {
    const res = await get<{ list: Course[]; total: number; page: number; pageSize: number }>('/courses')
    if (res.code === 0) courses.value = res.data.list
  } catch { /* */ } finally {
    loading.value = false
  }
}

async function fetchEnrollments() {
  if (!isLoggedIn.value) return
  try {
    const res = await get<Enrollment[]>('/enrollments/my')
    if (res.code === 0) enrollments.value = res.data
  } catch { /* */ }
}

function handleEnroll(courseId: number) {
  if (!isLoggedIn.value) {
    router.push({ name: 'login', query: { redirect: '/courses' } })
    return
  }
  const course = courses.value.find(c => c.id === courseId)
  if (course) {
    selectedCourse.value = course
    showConfirm.value = true
  }
}

async function confirmEnroll() {
  if (!selectedCourse.value) return
  enrolling.value = true
  try {
    const res = await post('/enrollments', { course_id: selectedCourse.value.id })
    if (res.code === 0) {
      showConfirm.value = false
      await Promise.all([fetchCourses(), fetchEnrollments()])
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
  <div class="max-w-5xl mx-auto px-4 py-4">
    <h1 class="text-xl4 font-bold text-secondary mb-4">课程列表</h1>

    <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="activeCategory = cat"
        class="px-5 py-2.5 rounded-xl2 text-lg font-bold whitespace-nowrap transition-colors"
        :class="activeCategory === cat
          ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md'
          : 'bg-white text-secondary hover:bg-cream-dark'"
      >
        {{ cat }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-12 text-secondary-light text-xl">加载中...</div>
    <Empty v-else-if="filteredCourses.length === 0" message="暂无课程" />
    <div v-else class="flex flex-col gap-4">
      <CourseCard
        v-for="course in filteredCourses"
        :key="course.id"
        :course="course"
        :enrolled="enrolledIds.has(course.id)"
        @enroll="handleEnroll"
      />
    </div>

    <Teleport to="body">
      <div v-if="showConfirm" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white rounded-xl3 p-6 w-full max-w-md shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl2 font-bold text-secondary">确认报名</h3>
            <button @click="showConfirm = false" class="p-2 text-secondary-light">
              <X class="w-6 h-6" />
            </button>
          </div>
          <p class="text-lg text-secondary mb-2">您要报名以下课程吗？</p>
          <p class="text-xl2 font-bold text-primary mb-1">{{ selectedCourse?.name }}</p>
          <p class="text-base text-secondary-light mb-4">授课老师：{{ selectedCourse?.teacher }}</p>
          <div class="flex gap-3">
            <button
              @click="showConfirm = false"
              class="flex-1 py-3 rounded-xl2 text-lg font-bold bg-cream-dark text-secondary"
            >
              取消
            </button>
            <button
              @click="confirmEnroll"
              :disabled="enrolling"
              class="flex-1 py-3 rounded-xl2 text-lg font-bold bg-gradient-to-r from-primary to-primary-dark text-white"
            >
              {{ enrolling ? '报名中...' : '确认报名' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
