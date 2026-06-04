<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo">
        <el-icon :size="28"><Camera /></el-icon>
        <span v-if="!isCollapse" class="logo-text">婚纱摄影协作</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="layout-menu"
      >
        <el-menu-item index="/orders">
          <el-icon><Document /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        <el-menu-item v-if="isCouple || isAdmin" index="/photo-selection">
          <el-icon><Picture /></el-icon>
          <template #title>照片选片</template>
        </el-menu-item>
        <el-menu-item v-if="isRetoucher || isAdmin" index="/retouch-tasks">
          <el-icon><Edit /></el-icon>
          <template #title>修图任务</template>
        </el-menu-item>
        <el-menu-item v-if="isCouple || isAdmin" index="/review-retouch">
          <el-icon><Check /></el-icon>
          <template #title>验收修图</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon
            class="collapse-icon"
            :size="20"
            @click="isCollapse = !isCollapse"
          >
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="(item, index) in breadcrumbs"
              :key="index"
            >
              {{ item }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32">
                {{ user?.name?.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ user?.name }}</span>
              <el-tag :type="roleTagType" size="small" class="role-tag">
                {{ roleText }}
              </el-tag>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Camera,
  Document,
  Picture,
  Edit,
  Check,
  Expand,
  Fold,
  User,
  SwitchButton
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { UserRole } from '@/types'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const activeMenu = ref(route.path)

const user = computed(() => userStore.user)
const isCouple = computed(() => userStore.isCouple)
const isRetoucher = computed(() => userStore.isRetoucher)
const isAdmin = computed(() => userStore.isAdmin)

const roleText = computed(() => {
  switch (user.value?.role) {
    case UserRole.COUPLE:
      return '新人'
    case UserRole.RETOUCHER:
      return '修图师'
    case UserRole.ADMIN:
      return '管理员'
    default:
      return '未知'
  }
})

const roleTagType = computed(() => {
  switch (user.value?.role) {
    case UserRole.COUPLE:
      return 'success'
    case UserRole.RETOUCHER:
      return 'warning'
    case UserRole.ADMIN:
      return 'danger'
    default:
      return 'info'
  }
})

const breadcrumbs = computed(() => {
  const pathMap: Record<string, string[]> = {
    '/orders': ['首页', '订单管理'],
    '/photo-selection': ['首页', '照片选片'],
    '/retouch-tasks': ['首页', '修图任务'],
    '/review-retouch': ['首页', '验收修图']
  }
  return pathMap[route.path] || ['首页']
})

onMounted(() => {
  userStore.loadUserFromStorage()
})

const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      userStore.logout()
      router.push('/login')
    }).catch(() => {})
  } else if (command === 'profile') {
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background: linear-gradient(180deg, #304156 0%, #1f2d3d 100%);
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
}

.layout-menu {
  border-right: none;
  background: transparent;
}

.layout-menu :deep(.el-menu-item) {
  color: #bfcbd9;
}

.layout-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.layout-menu :deep(.el-menu-item.is-active) {
  background: #409eff;
  color: #fff;
}

.layout-header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-icon {
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.collapse-icon:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f5f7fa;
}

.user-name {
  font-size: 14px;
  color: #303133;
}

.role-tag {
  margin-left: 4px;
}

.layout-main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
