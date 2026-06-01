<template>
  <div class="app-layout">
    <el-container>
      <el-header class="app-header">
        <div class="header-left">
          <el-icon :size="24" color="#409EFF"><Box /></el-icon>
          <span class="app-title">港口集装箱堆场堆位调度系统</span>
        </div>
        <el-menu :default-active="activeMenu" mode="horizontal" :ellipsis="false" router>
          <el-menu-item index="/">
            <el-icon><Monitor /></el-icon>全景视图
          </el-menu-item>
          <el-menu-item index="/containers">
            <el-icon><Grid /></el-icon>箱管
          </el-menu-item>
          <el-menu-item index="/appointments">
            <el-icon><Calendar /></el-icon>提箱预约
          </el-menu-item>
        </el-menu>
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Box, Monitor, Grid, Calendar } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => {
  if (route.path.startsWith('/bay/')) return '/'
  return route.path
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { height: 100%; }
.app-layout { height: 100%; background: #f0f2f5; }
.el-container { height: 100%; }
.app-header {
  display: flex; align-items: center; justify-content: space-between;
  background: #fff; border-bottom: 2px solid #409EFF; padding: 0 24px; height: 56px;
}
.header-left { display: flex; align-items: center; gap: 10px; }
.app-title { font-size: 18px; font-weight: 700; color: #303133; letter-spacing: 2px; }
.app-main { padding: 16px; overflow-y: auto; }
.el-menu--horizontal { border-bottom: none !important; }
</style>
