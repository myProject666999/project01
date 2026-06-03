<template>
  <div class="course-packages-container">
    <el-header class="header">
      <div class="back-btn" @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </div>
      <div class="title">课程包</div>
      <div style="width: 80px"></div>
    </el-header>

    <el-main class="main-content">
      <el-row :gutter="20">
        <el-col :span="8" v-for="pkg in packages" :key="pkg.id">
          <el-card class="package-card card-shadow">
            <div class="package-header" :class="pkg.level">
              <div class="package-level">{{ getLevelText(pkg.level) }}</div>
              <div class="package-price">¥{{ pkg.price }}</div>
            </div>
            <div class="package-body">
              <h3 class="package-name">{{ pkg.name }}</h3>
              <p class="package-desc">{{ pkg.description }}</p>
              <div class="package-features">
                <div class="feature-item">
                  <span class="feature-icon">📚</span>
                  <span>{{ pkg.totalLessons }}节课</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">⏰</span>
                  <span>每节{{ pkg.lessonDuration }}分钟</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">📅</span>
                  <span>{{ pkg.validDays }}天有效期</span>
                </div>
              </div>
              <el-button type="primary" class="buy-btn" @click="buyPackage(pkg)" :disabled="!pkg.isActive">
                {{ pkg.isActive ? '立即购买' : '暂不可用' }}
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getCoursePackagesApi, buyCoursePackageApi } from '@/api/course'
import type { CoursePackage } from '@/types'

const router = useRouter()
const packages = ref<CoursePackage[]>([])

onMounted(() => {
  loadPackages()
})

async function loadPackages() {
  try {
    const data = await getCoursePackagesApi()
    packages.value = data
  } catch (error) {
    console.error('Load packages error:', error)
  }
}

function getLevelText(level: string) {
  const map: Record<string, string> = {
    beginner: '入门级',
    elementary: '初级',
    intermediate: '中级',
    advanced: '高级',
    all: '全级别'
  }
  return map[level] || level
}

async function buyPackage(pkg: CoursePackage) {
  try {
    await buyCoursePackageApi(pkg.id)
    ElMessage.success('购买成功！')
    loadPackages()
  } catch (error) {
    console.error('Buy package error:', error)
    ElMessage.error('购买失败，请重试')
  }
}
</script>

<style scoped>
.course-packages-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.header {
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #909399;
  font-size: 14px;
}

.back-btn:hover {
  color: #409eff;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

.package-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.package-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.package-header {
  padding: 24px;
  color: #fff;
  text-align: center;
}

.package-header.beginner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.package-header.elementary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.package-header.intermediate {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.package-header.advanced {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.package-header.all {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.package-level {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.package-price {
  font-size: 36px;
  font-weight: 700;
}

.package-body {
  padding: 20px;
}

.package-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.package-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 16px 0;
}

.package-features {
  margin-bottom: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  font-size: 14px;
  color: #606266;
}

.feature-icon {
  font-size: 18px;
}

.buy-btn {
  width: 100%;
  height: 40px;
  border-radius: 20px;
  font-size: 15px;
}
</style>
