<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Home,
  Car,
  Wrench,
  Package,
  AlertTriangle,
  FileText,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  Menu,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const collapsed = ref(false)
const mobileMenuOpen = ref(false)

const menuItems = [
  { name: '首页', path: '/', icon: Home },
  { name: '车辆管理', path: '/vehicles', icon: Car },
  { name: '拆解管理', path: '/dismantling', icon: Wrench },
  { name: '库存管理', path: '/inventory', icon: Package },
  { name: '危废管理', path: '/hazardous', icon: AlertTriangle },
  { name: '联单管理', path: '/hazardous/waybill', icon: FileText },
  { name: '数据报送', path: '/report', icon: BarChart3 },
]

function toggleSidebar() {
  collapsed.value = !collapsed.value
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function isActive(path: string) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex">
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-40 transition-all duration-300 bg-slate-800 flex flex-col',
        collapsed ? 'w-16' : 'w-64',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="h-16 flex items-center justify-between px-4 border-b border-slate-700">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: #165DFF;">
            <Car class="w-5 h-5 text-white" />
          </div>
          <span v-if="!collapsed" class="text-white font-semibold text-lg whitespace-nowrap">
            报废车拆解系统
          </span>
        </div>
        <button
          v-if="!collapsed"
          @click="toggleSidebar"
          class="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors lg:block hidden"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
        <button
          v-else
          @click="toggleSidebar"
          class="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors lg:block hidden"
        >
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <button
          v-for="item in menuItems"
          :key="item.path"
          @click="router.push(item.path); mobileMenuOpen = false"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            isActive(item.path)
              ? 'text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50',
          ]"
          :style="isActive(item.path) ? 'background-color: #165DFF;' : ''"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="!collapsed" class="whitespace-nowrap">{{ item.name }}</span>
        </button>
      </nav>

      <div class="p-3 border-t border-slate-700">
        <div
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-lg',
            collapsed ? 'justify-center' : '',
          ]"
        >
          <div class="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
            <User class="w-4 h-4 text-slate-200" />
          </div>
          <div v-if="!collapsed" class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">
              {{ authStore.user?.name || '用户' }}
            </p>
            <p class="text-xs text-slate-400 truncate">
              {{ authStore.user?.role === 'admin' ? '管理员' : authStore.user?.role === 'operator' ? '操作员' : '危废管理员' }}
            </p>
          </div>
        </div>
      </div>
    </aside>

    <div
      v-if="mobileMenuOpen"
      @click="mobileMenuOpen = false"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden"
    />

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
        <div class="flex items-center gap-4">
          <button
            @click="toggleMobileMenu"
            class="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu class="w-5 h-5 text-gray-600" />
          </button>
          <h1 class="text-lg font-semibold text-gray-800">
            {{ menuItems.find(item => isActive(item.path))?.name || '系统' }}
          </h1>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2 mr-4">
            <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background-color: #165DFF;">
              <User class="w-4 h-4 text-white" />
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-800">{{ authStore.user?.name }}</p>
              <p class="text-xs text-gray-500">{{ authStore.user?.username }}</p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut class="w-4 h-4" />
            <span class="hidden sm:inline">退出登录</span>
          </button>
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>
