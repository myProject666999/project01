<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <h3 class="logo-text">司法鉴定管理</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/entrustment">
          <el-icon><Document /></el-icon>
          <span>委托登记</span>
        </el-menu-item>
        <el-menu-item index="/evidence">
          <el-icon><Box /></el-icon>
          <span>检材管理</span>
        </el-menu-item>
        <el-menu-item index="/evidence-chain">
          <el-icon><Link /></el-icon>
          <span>监管链查询</span>
        </el-menu-item>
        <el-menu-item index="/task">
          <el-icon><Tickets /></el-icon>
          <span>鉴定任务</span>
        </el-menu-item>
        <el-menu-item index="/inspection">
          <el-icon><EditPen /></el-icon>
          <span>检验记录</span>
        </el-menu-item>
        <el-menu-item index="/opinion">
          <el-icon><Reading /></el-icon>
          <span>意见书管理</span>
        </el-menu-item>
        <el-menu-item index="/review">
          <el-icon><CircleCheck /></el-icon>
          <span>复核管理</span>
        </el-menu-item>
        <el-menu-item index="logout" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleDropdownCommand">
            <div class="user-info">
              <el-icon class="user-icon"><UserFilled /></el-icon>
              <span class="user-name">{{ userInfo.name || '用户' }}</span>
              <el-tag size="small" type="info" class="user-role">{{ userInfo.roleName || '角色' }}</el-tag>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  HomeFilled, Document, Box, Link, Tickets, EditPen,
  Reading, CircleCheck, SwitchButton, UserFilled, ArrowDown
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const userInfo = computed(() => userStore.userInfo)
const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta.title || '')

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await userStore.logout()
    ElMessage.success('退出成功')
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('退出失败')
    }
  }
}

const handleDropdownCommand = (command) => {
  if (command === 'logout') {
    handleLogout()
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b2f3a;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  margin: 0;
  font-weight: 600;
}

.menu {
  border-right: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.page-title {
  font-size: 18px;
  color: #303133;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.user-icon {
  margin-right: 8px;
  color: #909399;
}

.user-name {
  margin-right: 10px;
  color: #606266;
}

.user-role {
  margin-right: 8px;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
