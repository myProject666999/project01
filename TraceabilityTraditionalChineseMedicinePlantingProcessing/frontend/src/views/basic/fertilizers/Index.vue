<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>肥料管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增肥料
          </el-button>
        </div>
      </template>
      <el-alert title="肥料管理页面开发中" type="info" show-icon />
    </el-card>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

function handleAdd() {
  ElMessage.info('新增功能开发中')
}
</script>
