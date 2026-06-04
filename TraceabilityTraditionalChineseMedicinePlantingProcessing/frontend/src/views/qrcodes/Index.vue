<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>二维码管理</span>
          <el-button type="primary" @click="handleGenerate">
            <el-icon><Plus /></el-icon>
            批量生成
          </el-button>
        </div>
      </template>
      <el-alert title="二维码管理页面开发中" type="info" show-icon />
    </el-card>
  </div>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

function handleGenerate() {
  ElMessage.info('生成功能开发中')
}
</script>
