<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h2>案件管理系统</h2>
      </div>
      <el-menu
        :default-active="$route.path"
        class="menu"
        router
      >
        <el-menu-item index="/">
          <el-icon><DataBoard /></el-icon>
          <span>案件看板</span>
        </el-menu-item>
        <el-menu-item index="/case-detail">
          <el-icon><Document /></el-icon>
          <span>案件详情</span>
        </el-menu-item>
        <el-menu-item index="/document">
          <el-icon><Files /></el-icon>
          <span>文书生成</span>
        </el-menu-item>
        <el-menu-item index="/work-hour">
          <el-icon><Timer /></el-icon>
          <span>工时账单</span>
        </el-menu-item>
        <el-menu-item index="/conflict-check">
          <el-icon><Warning /></el-icon>
          <span>利益冲突检索</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span class="title">律师事务所案件全周期管理系统</span>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
}

.layout-container {
  height: 100%;
}

.sidebar {
  background-color: #304156;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-bottom: 1px solid #1f2d3d;
}

.logo h2 {
  font-size: 16px;
}

.menu {
  border-right: none;
  background-color: #304156;
}

.menu .el-menu-item {
  color: #bfcbd9;
}

.menu .el-menu-item:hover {
  background-color: #263445;
}

.menu .el-menu-item.is-active {
  background-color: #409eff;
  color: #fff;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header .title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
