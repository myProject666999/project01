<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Paintbrush, Music, Footprints, Scissors, Megaphone, ChevronRight } from 'lucide-vue-next'
import { get } from '@/lib/api'
import type { Course, Announcement } from '@/lib/types'
import CourseCard from '@/components/CourseCard.vue'
import Empty from '@/components/Empty.vue'

const router = useRouter()

const categories = [
  { name: '书画', icon: Paintbrush, color: 'bg-red-100 text-red-600' },
  { name: '声乐', icon: Music, color: 'bg-blue-100 text-blue-600' },
  { name: '舞蹈', icon: Footprints, color: 'bg-purple-100 text-purple-600' },
  { name: '手工', icon: Scissors, color: 'bg-green-100 text-green-600' },
]

const hotCourses = ref<Course[]>([])
const announcements = ref<Announcement[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [coursesRes, announcementsRes] = await Promise.all([
      get<{ list: Course[]; total: number; page: number; pageSize: number }>('/courses'),
      get<Announcement[]>('/announcements'),
    ])
    if (coursesRes.code === 0) {
      hotCourses.value = coursesRes.data.list.slice(0, 4)
    }
    if (announcementsRes.code === 0) {
      announcements.value = announcementsRes.data
    }
  } catch {
    // silently fail
  } finally {
    loading.value = false
  }
})

function goCategory(cat: string) {
  router.push({ path: '/courses', query: { category: cat } })
}

function goCourse(id: number) {
  router.push(`/courses/${id}`)
}

function handleEnroll(courseId: number) {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push({ name: 'login', query: { redirect: `/courses/${courseId}` } })
    return
  }
  router.push(`/courses/${courseId}`)
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-4">
    <section class="mb-6">
      <h2 class="text-xl3 font-bold text-secondary mb-4">课程分类</h2>
      <div class="grid grid-cols-4 gap-3">
        <button
          v-for="cat in categories"
          :key="cat.name"
          @click="goCategory(cat.name)"
          class="flex flex-col items-center justify-center gap-2 p-4 rounded-xl2 bg-white shadow-sm active:scale-95 transition-transform"
        >
          <div class="w-16 h-16 rounded-xl2 flex items-center justify-center" :class="cat.color">
            <component :is="cat.icon" class="w-8 h-8" />
          </div>
          <span class="text-lg font-bold text-secondary">{{ cat.name }}</span>
        </button>
      </div>
    </section>

    <section class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl3 font-bold text-secondary">热门课程</h2>
        <button @click="router.push('/courses')" class="flex items-center text-primary text-lg font-medium">
          查看全部 <ChevronRight class="w-5 h-5" />
        </button>
      </div>
      <div v-if="loading" class="text-center py-8 text-secondary-light text-xl">加载中...</div>
      <div v-else-if="hotCourses.length === 0">
        <Empty message="暂无热门课程" />
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CourseCard
          v-for="course in hotCourses"
          :key="course.id"
          :course="course"
          @enroll="handleEnroll"
        />
      </div>
    </section>

    <section class="mb-6">
      <h2 class="text-xl3 font-bold text-secondary mb-4">公告通知</h2>
      <div v-if="announcements.length === 0" class="bg-white rounded-xl2 p-4 text-secondary-light text-lg">
        暂无公告
      </div>
      <div v-else class="bg-white rounded-xl2 shadow-sm overflow-hidden">
        <div
          v-for="(item, idx) in announcements"
          :key="item.id"
          class="flex items-start gap-3 p-4"
          :class="idx < announcements.length - 1 ? 'border-b border-cream-dark' : ''"
        >
          <Megaphone class="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="text-lg font-bold text-secondary truncate">{{ item.title }}</p>
            <p class="text-base text-secondary-light line-clamp-2">{{ item.content }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
