<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, BookOpen, Calendar, User, GraduationCap, Users, ClipboardList } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { isLoggedIn, user } = useAuth()

const navItems = computed(() => [
  { name: '首页', icon: Home, path: '/' },
  { name: '课程', icon: BookOpen, path: '/courses' },
  { name: '课表', icon: Calendar, path: '/schedule' },
  { name: '考勤', icon: ClipboardList, path: '/attendance' },
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
  <header class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-primary-dark shadow-lg">
    <div class="max-w-5xl mx-auto flex items-center justify-between px-4 h-16">
      <div class="flex items-center gap-2 cursor-pointer" @click="navigate('/')">
        <GraduationCap class="w-8 h-8 text-white" />
        <span class="text-white font-bold text-xl2">老年大学</span>
      </div>
      <nav class="hidden md:flex items-center gap-1">
        <button
          v-for="item in navItems"
          :key="item.path"
          @click="navigate(item.path)"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl2 text-lg transition-colors"
          :class="isActive(item.path) ? 'bg-white/20 text-white font-bold' : 'text-white/80 hover:bg-white/10'"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.name }}</span>
        </button>
      </nav>
      <div v-if="isLoggedIn" class="hidden md:flex items-center gap-2 text-white/90">
        <User class="w-5 h-5" />
        <span>{{ user?.name }}</span>
      </div>
    </div>
  </header>
</template>
