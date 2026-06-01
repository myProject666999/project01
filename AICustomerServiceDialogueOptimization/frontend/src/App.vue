<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon size="24"><Monitor /></el-icon>
        <span>AI客服质检系统</span>
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
        <el-menu-item index="/quality-task">
          <el-icon><ListCheck /></el-icon>
          <span>质检任务</span>
        </el-menu-item>
        <el-menu-item index="/conversation">
          <el-icon><ChatDotRound /></el-icon>
          <span>会话质检</span>
        </el-menu-item>
        <el-menu-item index="/violation">
          <el-icon><Warning /></el-icon>
          <span>违规记录</span>
        </el-menu-item>
        <el-menu-item index="/appeal">
          <el-icon><Document /></el-icon>
          <span>申诉管理</span>
        </el-menu-item>
        <el-menu-item index="/script">
          <el-icon><Collection /></el-icon>
          <span>话术库</span>
        </el-menu-item>
        <el-menu-item index="/ranking">
          <el-icon><Trophy /></el-icon>
          <span>评分排行</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span>{{ pageTitle }}</span>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><User /></el-icon>
              管理员
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
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
import { useRoute } from 'vue-router'

const route = useRoute()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta.title || 'AI客服质检系统')
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  gap: 8px;
  border-bottom: 1px solid #1f2d3d;
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
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
}

.main-content {
  background-color: #f5f7fa;
  overflow-y: auto;
}
</style>
