<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>婚纱摄影选片修图协作系统</span>
        </div>
      </template>
      <div class="card-content">
        <el-empty description="欢迎使用系统" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: 500;
}

.card-content {
  padding: 40px 0;
}
</style>
