<template>
  <div class="flex h-full">
    <aside
      class="sidebar flex-shrink-0 flex flex-col transition-all duration-300"
      :style="{ width: collapsed ? '64px' : '240px' }"
    >
      <div class="sidebar-logo flex items-center justify-center h-[60px] border-b border-white/10">
        <el-icon :size="24" class="text-white"><Ship /></el-icon>
        <span v-show="!collapsed" class="ml-2 text-white text-lg font-bold whitespace-nowrap">海洋牧场</span>
      </div>
      <nav class="flex-1 py-4 overflow-y-auto">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item flex items-center px-5 py-3 mx-2 rounded-lg transition-all duration-200 no-underline"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon :size="20"><component :is="item.icon" /></el-icon>
          <span v-show="!collapsed" class="ml-3 text-sm whitespace-nowrap">{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="p-3 border-t border-white/10">
        <div
          class="flex items-center justify-center py-2 cursor-pointer text-white/60 hover:text-white transition-colors"
          @click="collapsed = !collapsed"
        >
          <el-icon :size="18">
            <DArrowLeft v-if="!collapsed" />
            <DArrowRight v-else />
          </el-icon>
        </div>
      </div>
    </aside>
    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-[60px] bg-white border-b border-[var(--color-border)] flex items-center justify-between px-6 flex-shrink-0">
        <h1 class="text-lg font-semibold text-[var(--color-primary)]">{{ currentTitle }}</h1>
        <div class="flex items-center gap-4">
          <el-tag type="success" effect="dark" round>管理员</el-tag>
        </div>
      </header>
      <main class="flex-1 overflow-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Ship, Odometer, MapLocation, Document, EditPen, DataAnalysis, TrendCharts, Monitor, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'

const route = useRoute()
const collapsed = ref(false)

const menuItems = [
  { path: '/', label: '仪表盘', icon: Odometer },
  { path: '/sea-area', label: '海域区域管理', icon: MapLocation },
  { path: '/release-plan', label: '投放计划管理', icon: Document },
  { path: '/release-record', label: '投放执行登记', icon: EditPen },
  { path: '/recapture', label: '回捕统计', icon: DataAnalysis },
  { path: '/recapture-analysis', label: '回捕率分析', icon: TrendCharts },
  { path: '/water-quality', label: '水质监测', icon: Monitor },
]

const currentTitle = computed(() => {
  const item = menuItems.find(m => m.path === route.path)
  return item?.label || '仪表盘'
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.sidebar {
  background: linear-gradient(180deg, #0A2647 0%, #144272 50%, #205295 100%);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.nav-item {
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
}

.nav-item:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  color: #fff;
  background: rgba(44, 120, 101, 0.6);
  font-weight: 600;
}
</style>
