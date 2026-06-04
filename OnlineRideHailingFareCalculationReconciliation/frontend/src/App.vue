<template>
  <el-container class="app-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon size="32"><Van /></el-icon>
        <span>出租车对账系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="menu"
        @select="handleSelect"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-sub-menu index="driver">
          <template #title>
            <el-icon><User /></el-icon>
            <span>司机端</span>
          </template>
          <el-menu-item index="/driver">我的首页</el-menu-item>
          <el-menu-item index="/driver/daily-report">流水清单</el-menu-item>
          <el-menu-item index="/driver/appeals">我的申诉</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="admin">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>管理端</span>
          </template>
          <el-menu-item index="/admin/reconciliation">对账管理</el-menu-item>
          <el-menu-item index="/admin/orders">订单管理</el-menu-item>
          <el-menu-item index="/admin/appeals">申诉处理</el-menu-item>
          <el-menu-item index="/admin/pricing">计价规则</el-menu-item>
          <el-menu-item index="/admin/drivers">司机管理</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-title">{{ currentTitle }}</div>
        <div class="header-right">
          <el-select v-model="selectedDriver" placeholder="选择司机" @change="handleDriverChange" style="width: 150px;">
            <el-option
              v-for="driver in drivers"
              :key="driver.id"
              :label="driver.driver_name"
              :value="driver.id"
            />
          </el-select>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { driverApi } from '@/api'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => {
  const titleMap = {
    '/dashboard': '首页',
    '/driver': '司机首页',
    '/driver/daily-report': '流水清单',
    '/driver/appeals': '我的申诉',
    '/admin/reconciliation': '对账管理',
    '/admin/orders': '订单管理',
    '/admin/appeals': '申诉处理',
    '/admin/pricing': '计价规则',
    '/admin/drivers': '司机管理'
  }
  return titleMap[route.path] || '出租车对账系统'
})

const drivers = ref([])
const selectedDriver = ref(1)

onMounted(() => {
  loadDrivers()
})

const loadDrivers = async () => {
  try {
    const res = await driverApi.getList()
    drivers.value = res.data
    if (drivers.value.length > 0 && !selectedDriver.value) {
      selectedDriver.value = drivers.value[0].id
    }
  } catch (e) {
    console.error(e)
  }
}

const handleSelect = (index) => {
  router.push(index)
}

const handleDriverChange = (val) => {
  localStorage.setItem('selectedDriver', val)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
}

.app-container {
  height: 100%;
}

.sidebar {
  background: #304156;
  color: #fff;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #1f2d3d;
}

.menu {
  border-right: none;
  background: #304156;
}

.menu :deep(.el-menu-item),
.menu :deep(.el-sub-menu__title) {
  color: #bfcbd9;
}

.menu :deep(.el-menu-item:hover),
.menu :deep(.el-sub-menu__title:hover) {
  background: #263445;
  color: #fff;
}

.menu :deep(.el-menu-item.is-active) {
  background: #409eff;
  color: #fff;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.main-content {
  background: #f5f7fa;
  padding: 20px;
}
</style>
