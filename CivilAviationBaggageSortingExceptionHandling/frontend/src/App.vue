<template>
  <el-container style="min-height: 100vh">
    <el-aside width="220px" style="background: #001529">
      <div style="padding: 20px 16px; text-align: center; border-bottom: 1px solid #003a70">
        <h2 style="color: #fff; margin: 0; font-size: 16px">民航行李分拣</h2>
        <p style="color: #85b8d9; margin: 4px 0 0; font-size: 12px">异常处理系统</p>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#001529"
        text-color="#ffffffa6"
        active-text-color="#1890ff"
        style="border-right: none"
      >
        <el-menu-item index="/baggages">
          <el-icon><Suitcase /></el-icon>
          <span>行李管理</span>
        </el-menu-item>
        <el-menu-item index="/sortings">
          <el-icon><Guide /></el-icon>
          <span>分拣管理</span>
        </el-menu-item>
        <el-menu-item index="/exceptions">
          <el-icon><Warning /></el-icon>
          <span>异常工单</span>
        </el-menu-item>
        <el-menu-item index="/query">
          <el-icon><Search /></el-icon>
          <span>旅客查询</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main style="background: #f0f2f5; padding: 20px">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
</script>
