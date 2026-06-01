<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <h2>中央厨房</h2>
        <p>净菜配送系统</p>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#1890ff"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/customers">
          <el-icon><User /></el-icon>
          <span>客户管理</span>
        </el-menu-item>
        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <span>菜品管理</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/processing">
          <el-icon><Setting /></el-icon>
          <span>加工排程</span>
        </el-menu-item>
        <el-menu-item index="/deliveries">
          <el-icon><Van /></el-icon>
          <span>配送管理</span>
        </el-menu-item>
        <el-menu-item index="/waste">
          <el-icon><Delete /></el-icon>
          <span>报废登记</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-title">{{ currentTitle }}</div>
        <div class="header-right">
          <el-icon class="header-icon"><Bell /></el-icon>
          <el-icon class="header-icon"><UserFilled /></el-icon>
        </div>
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

const currentTitle = computed(() => {
  const titles = {
    '/dashboard': '数据概览',
    '/customers': '客户管理',
    '/products': '菜品管理',
    '/orders': '订单管理',
    '/processing': '加工排程',
    '/deliveries': '配送管理',
    '/waste': '报废登记'
  }
  return titles[route.path] || '中央厨房净菜配送系统'
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #001529;
  overflow: hidden;
}

.logo {
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  font-size: 20px;
  margin: 0;
}

.logo p {
  font-size: 12px;
  margin: 5px 0 0 0;
  opacity: 0.8;
}

.header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  gap: 20px;
}

.header-icon {
  font-size: 20px;
  color: #666;
  cursor: pointer;
}

.main-content {
  background-color: #f0f2f5;
  overflow-y: auto;
}
</style>
