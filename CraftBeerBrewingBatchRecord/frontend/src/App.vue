<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <el-icon :size="28" color="#67c23a"><Beer /></el-icon>
        <span class="logo-text">精酿啤酒管理</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="menu"
        background-color="#001529"
        text-color="#b8c7ce"
        active-text-color="#67c23a"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表板</span>
        </el-menu-item>
        <el-menu-item index="/recipes">
          <el-icon><Document /></el-icon>
          <span>配方管理</span>
        </el-menu-item>
        <el-menu-item index="/batches">
          <el-icon><List /></el-icon>
          <span>批次管理</span>
        </el-menu-item>
        <el-menu-item index="/temperature">
          <el-icon><TrendCharts /></el-icon>
          <span>温度曲线</span>
        </el-menu-item>
        <el-menu-item index="/tastings">
          <el-icon><Star /></el-icon>
          <span>品测记录</span>
        </el-menu-item>
        <el-menu-item index="/traceability">
          <el-icon><Search /></el-icon>
          <span>批次追溯</span>
        </el-menu-item>
        <el-menu-item index="/materials">
          <el-icon><Box /></el-icon>
          <span>原料管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-title">
          <el-icon :size="20" color="#67c23a"><Location /></el-icon>
          <span>{{ currentPageTitle }}</span>
        </div>
        <div class="header-user">
          <el-icon><User /></el-icon>
          <span>管理员</span>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeMenu = computed(() => route.path)

const pageTitles = {
  '/dashboard': '系统仪表板',
  '/recipes': '配方管理',
  '/batches': '批次管理',
  '/temperature': '温度曲线监控',
  '/tastings': '品测记录',
  '/traceability': '批次追溯',
  '/materials': '原料管理'
}

const currentPageTitle = computed(() => {
  const path = route.path
  for (const [key, title] of Object.entries(pageTitles)) {
    if (path.startsWith(key)) {
      return title
    }
  }
  return '精酿啤酒批次记录系统'
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #001529;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #002140;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.menu {
  flex: 1;
  border-right: none;
}

.header {
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100vh;
}
</style>
