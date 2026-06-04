<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon size="28"><Collection /></el-icon>
        <span>拍卖管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        <el-menu-item index="/auctions">
          <el-icon><Tickets /></el-icon>
          <span>拍卖会管理</span>
        </el-menu-item>
        <el-menu-item index="/bidders">
          <el-icon><User /></el-icon>
          <span>竞买人管理</span>
        </el-menu-item>
        <el-menu-item index="/qualifications">
          <el-icon><CircleCheck /></el-icon>
          <span>资格审核</span>
        </el-menu-item>
        <el-menu-item index="/appointments">
          <el-icon><Calendar /></el-icon>
          <span>预展预约</span>
        </el-menu-item>
        <el-menu-item index="/results">
          <el-icon><Document /></el-icon>
          <span>拍卖结果</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
              {{ item }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              {{ userStore.user?.real_name }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

const breadcrumbs = computed(() => {
  const map = {
    '/dashboard': ['数据概览'],
    '/auctions': ['拍卖会管理'],
    '/bidders': ['竞买人管理'],
    '/qualifications': ['资格审核'],
    '/appointments': ['预展预约'],
    '/results': ['拍卖结果']
  }
  for (const key in map) {
    if (route.path.startsWith(key)) {
      if (route.params.id) {
        return [...map[key], '详情']
      }
      return map[key]
    }
  }
  return ['首页']
})

const handleCommand = async (command) => {
  if (command === 'logout') {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background: #304156;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #1f2d3d;
}

.logo span {
  margin-left: 10px;
}

.header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-right .user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.header-right .user-info span {
  margin: 0 5px;
}

.main-content {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
