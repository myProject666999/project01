<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, BookOpen, Calendar, Users, User } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { isLoggedIn } = useAuth()

const tabs = computed(() => [
  { name: '首页', icon: Home, path: '/' },
  { name: '课程', icon: BookOpen, path: '/courses' },
  { name: '课表', icon: Calendar, path: '/schedule' },
  { name: '社团', icon: Users, path: '/clubs' },
  { name: '我的', icon: User, path: isLoggedIn.value ? '/profile' : '/login' },
])

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-cream-dark md:hidden safe-area-bottom">
    <div class="flex items-center justify-around h-18 px-2">
      <button
        v-for="tab in tabs"
        :key="tab.path"
        @click="navigate(tab.path)"
        class="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl2 min-w-touch transition-colors"
        :class="isActive(tab.path) ? 'text-primary' : 'text-secondary-light'"
      >
        <component :is="tab.icon" class="w-7 h-7" />
        <span class="text-sm font-medium">{{ tab.name }}</span>
      </button>
    </div>
  </nav>
</template>
