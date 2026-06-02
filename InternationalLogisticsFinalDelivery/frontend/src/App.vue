<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon :size="28" color="#fff"><Van /></el-icon>
        <span class="logo-text">物流尾程系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#ffd04b"
        router
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/batches">
          <el-icon><Box /></el-icon>
          <span>批次管理</span>
        </el-menu-item>
        <el-menu-item index="/packages">
          <el-icon><Goods /></el-icon>
          <span>包裹管理</span>
        </el-menu-item>
        <el-menu-item index="/labels">
          <el-icon><Tickets /></el-icon>
          <span>面单管理</span>
        </el-menu-item>
        <el-menu-item index="/routes">
          <el-icon><Location /></el-icon>
          <span>路线规划</span>
        </el-menu-item>
        <el-menu-item index="/tasks">
          <el-icon><List /></el-icon>
          <span>派送任务</span>
        </el-menu-item>
        <el-menu-item index="/exceptions">
          <el-icon><Warning /></el-icon>
          <span>异常处理</span>
        </el-menu-item>
        <el-menu-item index="/couriers">
          <el-icon><User /></el-icon>
          <span>派送员管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span class="header-title">国际物流尾程派送管理系统</span>
      </el-header>
      <el-main class="main-content">
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
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  overflow-y: auto;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #2b2f3a;
  color: #fff;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
}

.sidebar :deep(.el-menu) {
  border-right: none;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
