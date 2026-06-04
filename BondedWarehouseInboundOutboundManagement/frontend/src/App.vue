<template>
  <el-container class="layout-container">
    <el-header class="header">
      <h1>保税仓出入库管理系统</h1>
    </el-header>
    <el-container>
      <el-aside width="200px" class="aside">
        <el-menu
          :default-active="activeMenu"
          router
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/locations">
            <el-icon><Location /></el-icon>
            <span>库位管理</span>
          </el-menu-item>
          <el-menu-item index="/inbound">
            <el-icon><Box /></el-icon>
            <span>入库管理</span>
          </el-menu-item>
          <el-menu-item index="/orders">
            <el-icon><Document /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/waves">
            <el-icon><List /></el-icon>
            <span>波次拣货</span>
          </el-menu-item>
          <el-menu-item index="/review">
            <el-icon><CircleCheck /></el-icon>
            <span>复核管理</span>
          </el-menu-item>
          <el-menu-item index="/outbound">
            <el-icon><Van /></el-icon>
            <span>出库报关</span>
          </el-menu-item>
          <el-menu-item index="/inventory">
            <el-icon><DataAnalysis /></el-icon>
            <span>库存盘点</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { House, Goods, Location, Box, Document, List, CircleCheck, Van, DataAnalysis } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.header {
  background: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}
.header h1 {
  margin: 0;
  font-size: 20px;
}
.aside {
  background: #545c64;
}
.main {
  background: #f0f2f5;
  padding: 20px;
}
</style>
