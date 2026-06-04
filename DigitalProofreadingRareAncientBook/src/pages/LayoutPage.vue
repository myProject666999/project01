<template>
  <div class="flex h-screen bg-ink-50">
    <aside class="w-64 bg-ink-900 text-ink-100 flex flex-col">
      <div class="p-6 border-b border-ink-700">
        <h1 class="text-xl font-serif flex items-center gap-3">
          <span class="text-2xl">📜</span>
          <span>古籍校对系统</span>
        </h1>
      </div>
      
      <nav class="flex-1 p-4 space-y-2">
        <RouterLink
          to="/books"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-ink-800 transition-colors"
          :class="{ 'bg-ink-800 text-white': $route.name === 'books' }"
        >
          <BookOpen class="w-5 h-5" />
          <span>书籍管理</span>
        </RouterLink>
        <RouterLink
          to="/dictionaries"
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-ink-800 transition-colors"
          :class="{ 'bg-ink-800 text-white': $route.name === 'dictionaries' }"
        >
          <BookMarked class="w-5 h-5" />
          <span>字典管理</span>
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-ink-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center">
              <User class="w-4 h-4" />
            </div>
            <div>
              <div class="text-sm font-medium">{{ user?.displayName }}</div>
              <div class="text-xs text-ink-400">{{ roleText }}</div>
            </div>
          </div>
          <button @click="handleLogout" class="text-ink-400 hover:text-white transition-colors">
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, BookMarked, User, LogOut } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, logout } = useAuth()

const roleText = computed(() => {
  const roles: Record<string, string> = {
    admin: '管理员',
    proofreader: '校对员',
    reviewer: '审稿人',
  }
  return roles[user.value?.role || ''] || ''
})

function handleLogout() {
  logout()
  router.push('/login')
}
</script>
