<template>
  <el-container class="app-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <span class="logo-icon">🍵</span>
        <span class="logo-text">茶叶仓储管理</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#1f2d3d"
        text-color="#c0c4cc"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>系统概览</span>
        </el-menu-item>
        <el-menu-item index="/tea-products">
          <el-icon><Goods /></el-icon>
          <span>茶品档案</span>
        </el-menu-item>
        <el-menu-item index="/storage-locations">
          <el-icon><OfficeBuilding /></el-icon>
          <span>仓位管理</span>
        </el-menu-item>
        <el-menu-item index="/inventory">
          <el-icon><Box /></el-icon>
          <span>库存管理</span>
        </el-menu-item>
        <el-menu-item index="/environment">
          <el-icon><Monitor /></el-icon>
          <span>环境监控</span>
        </el-menu-item>
        <el-menu-item index="/tasting-notes">
          <el-icon><EditPen /></el-icon>
          <span>品鉴笔记</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span class="page-title">{{ currentPageTitle }}</span>
        </div>
        <div class="header-right">
          <el-tooltip content="刷新数据" placement="bottom">
            <el-button type="primary" :icon="Refresh" circle @click="refreshPage" />
          </el-tooltip>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-if="isRouterAlive" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Refresh, DataAnalysis, Goods, OfficeBuilding, Box, Monitor, EditPen } from '@element-plus/icons-vue'

const route = useRoute()
const isRouterAlive = ref(true)

const activeMenu = computed(() => route.path)
const currentPageTitle = computed(() => route.meta.title || '茶叶仓储与品鉴管理系统')

const refreshPage = () => {
  isRouterAlive.value = false
  setTimeout(() => {
    isRouterAlive.value = true
  }, 0)
}
</script>

<style scoped>
.app-container {
  height: 100%;
}

.sidebar {
  background-color: #1f2d3d;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid #304156;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  color: #ffd04b;
  font-size: 16px;
  font-weight: 600;
}

.el-menu {
  border-right: none;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.main-content {
  background-color: #f5f7fa;
  overflow-y: auto;
}
</style>
