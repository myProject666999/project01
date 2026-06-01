<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { get, del } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import type { Enrollment, Course } from '@/lib/types'
import Empty from '@/components/Empty.vue'
import { User, BookOpen, ClipboardList, CalendarDays, LogOut, ChevronRight, X } from 'lucide-vue-next'

const router = useRouter()
const { user, isLoggedIn, logout, fetchProfile } = useAuth()

const enrollments = ref<(Enrollment & { course?: Course })[]>([])
const loading = ref(true)
const showDropConfirm = ref(false)
const dropId = ref<number | null>(null)
const dropping = ref(false)

const menuItems = [
  { name: '我的报名', icon: BookOpen, path: '/profile', action: 'enrollments' },
  { name: '候补状态', icon: ClipboardList, path: '/waitlist' },
  { name: '考勤查询', icon: CalendarDays, path: '/attendance' },
]

onMounted(async () => {
  if (isLoggedIn.value) {
    await Promise.all([fetchProfile(), fetchEnrollments()])
  }
  loading.value = false
})

async function fetchEnrollments() {
  try {
    const res = await get<(Enrollment & { course?: Course })[]>('/enrollments/my')
    if (res.code === 0) enrollments.value = res.data
  } catch { /* */ }
}

function confirmDrop(id: number) {
  dropId.value = id
  showDropConfirm.value = true
}

async function doDrop() {
  if (!dropId.value) return
  dropping.value = true
  try {
    const res = await del(`/enrollments/${dropId.value}`)
    if (res.code === 0) {
      enrollments.value = enrollments.value.filter(e => e.id !== dropId.value)
      showDropConfirm.value = false
    } else {
      alert(res.message || '退课失败')
    }
  } catch {
    alert('退课失败，请稍后重试')
  } finally {
    dropping.value = false
  }
}

function handleLogout() {
  logout()
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-4">
    <div v-if="loading" class="text-center py-12 text-secondary-light text-xl">加载中...</div>
    <template v-else-if="!isLoggedIn">
      <div class="text-center py-16">
        <User class="w-20 h-20 text-cream-dark mx-auto mb-4" />
        <p class="text-xl2 text-secondary-light mb-6">请先登录</p>
        <button
          @click="router.push('/login')"
          class="px-8 py-3 rounded-xl2 text-xl font-bold bg-gradient-to-r from-primary to-primary-dark text-white"
        >
          去登录
        </button>
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col items-center mb-6">
        <div class="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-3">
          <User class="w-12 h-12 text-primary" />
        </div>
        <h2 class="text-xl3 font-bold text-secondary">{{ user?.name || '用户' }}</h2>
        <p class="text-base text-secondary-light">{{ user?.phone || '' }}</p>
      </div>

      <div class="bg-white rounded-xl2 shadow-sm overflow-hidden mb-6">
        <button
          v-for="item in menuItems"
          :key="item.name"
          @click="item.path !== '/profile' ? router.push(item.path) : null"
          class="w-full flex items-center justify-between px-5 py-4 active:bg-cream-dark transition-colors"
        >
          <div class="flex items-center gap-3">
            <component :is="item.icon" class="w-6 h-6 text-primary" />
            <span class="text-xl text-secondary">{{ item.name }}</span>
          </div>
          <ChevronRight class="w-5 h-5 text-secondary-light" />
        </button>
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-between px-5 py-4 active:bg-cream-dark transition-colors border-t border-cream-dark"
        >
          <div class="flex items-center gap-3">
            <LogOut class="w-6 h-6 text-red-500" />
            <span class="text-xl text-red-500 font-bold">退出登录</span>
          </div>
        </button>
      </div>

      <h3 class="text-xl2 font-bold text-secondary mb-3">我的报名</h3>
      <Empty v-if="enrollments.length === 0" message="暂无报名课程" />
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="e in enrollments"
          :key="e.id"
          class="bg-white rounded-xl2 p-4 shadow-sm flex items-center justify-between"
        >
          <div class="flex-1 min-w-0">
            <h4 class="text-xl font-bold text-secondary truncate">{{ e.course?.name || '未知课程' }}</h4>
            <p class="text-base text-secondary-light">{{ e.course?.teacher }} · {{ e.course?.schedule_day }} {{ e.course?.schedule_time }}</p>
          </div>
          <button
            @click="confirmDrop(e.id)"
            class="ml-3 px-4 py-2 rounded-xl2 text-base font-bold bg-red-100 text-red-600 active:scale-95 transition flex-shrink-0"
          >
            退课
          </button>
        </div>
      </div>
    </template>

    <Teleport to="body">
      <div v-if="showDropConfirm" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white rounded-xl3 p-6 w-full max-w-md shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl2 font-bold text-secondary">确认退课</h3>
            <button @click="showDropConfirm = false" class="p-2 text-secondary-light">
              <X class="w-6 h-6" />
            </button>
          </div>
          <p class="text-lg text-secondary mb-4">确定要退出该课程吗？退课后名额将释放给其他学员。</p>
          <div class="flex gap-3">
            <button
              @click="showDropConfirm = false"
              class="flex-1 py-3 rounded-xl2 text-lg font-bold bg-cream-dark text-secondary"
            >
              取消
            </button>
            <button
              @click="doDrop"
              :disabled="dropping"
              class="flex-1 py-3 rounded-xl2 text-lg font-bold bg-red-500 text-white"
            >
              {{ dropping ? '处理中...' : '确认退课' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
