<template>
  <el-container class="layout-container">
    <el-header class="layout-header">
      <div class="header-content">
        <div class="logo">
          <el-icon :size="32" color="#409eff"><Watermelon /></el-icon>
          <span class="title">印染厂废水排放监测系统</span>
        </div>
        <div class="header-right">
          <el-badge :value="pendingCount" :hidden="pendingCount === 0" class="notice-badge">
            <el-button type="primary" link @click="$router.push('/shutdown-order')">
              <el-icon><Bell /></el-icon>
              待处理
            </el-button>
          </el-badge>
          <span class="user-info">管理员</span>
        </div>
      </div>
    </el-header>
    <el-container>
      <el-aside width="220px" class="layout-aside">
        <el-menu
          :default-active="activeMenu"
          class="aside-menu"
          router
          background-color="#001529"
          text-color="#b0b7bc"
          active-text-color="#fff">
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>实时监控</span>
          </el-menu-item>
          <el-menu-item index="/discharge-point">
            <el-icon><Location /></el-icon>
            <span>排放点管理</span>
          </el-menu-item>
          <el-menu-item index="/monitor-data">
            <el-icon><Histogram /></el-icon>
            <span>监测数据</span>
          </el-menu-item>
          <el-menu-item index="/alarm-record">
            <el-icon><Warning /></el-icon>
            <span>报警记录</span>
          </el-menu-item>
          <el-menu-item index="/shutdown-order">
            <el-icon><SwitchButton /></el-icon>
            <span>停机指令</span>
          </el-menu-item>
          <el-menu-item index="/recovery-application">
            <el-icon><CircleCheck /></el-icon>
            <span>复产申请</span>
          </el-menu-item>
          <el-menu-item index="/env-report">
            <el-icon><Upload /></el-icon>
            <span>环保报送</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'

const route = useRoute()
const activeMenu = ref('/dashboard')
const pendingCount = ref(0)

const fetchPendingCount = async () => {
  try {
    const res1 = await request.get('/shutdown-order/pending-count')
    const res2 = await request.get('/recovery-application/pending-count')
    pendingCount.value = (res1.data || 0) + (res2.data || 0)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  activeMenu.value = route.path
  fetchPendingCount()
  setInterval(fetchPendingCount, 30000)
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.layout-header {
  background: linear-gradient(90deg, #1890ff 0%, #096dd9 100%);
  padding: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 24px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
}
.title {
  font-size: 20px;
  font-weight: 600;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.notice-badge :deep(.el-button) {
  color: #fff !important;
}
.user-info {
  color: #fff;
  font-size: 14px;
}
.layout-aside {
  background: #001529;
}
.aside-menu {
  border-right: none;
  height: 100%;
}
.layout-main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
