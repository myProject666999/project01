<template>
  <div class="sheet-music-container">
    <el-header class="header">
      <div class="back-btn" @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </div>
      <div class="title">曲谱库</div>
      <div style="width: 80px"></div>
    </el-header>

    <el-main class="main-content">
      <el-row :gutter="20">
        <el-col :span="6" v-for="sheet in sheetMusic" :key="sheet.id">
          <el-card class="sheet-card card-shadow" @click="viewSheet(sheet)">
            <div class="sheet-cover">
              <img :src="sheet.thumbnailUrl || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=piano%20sheet%20music%20score&image_size=square'" alt="曲谱封面" />
              <div class="sheet-badge" :class="sheet.difficultyLevel">{{ getDifficultyText(sheet.difficultyLevel) }}</div>
            </div>
            <div class="sheet-info">
              <h4 class="sheet-title">{{ sheet.title }}</h4>
              <p class="sheet-composer">{{ sheet.composer }}</p>
              <div class="sheet-meta">
                <span class="meta-item">
                  <el-icon><Document /></el-icon>
                  {{ sheet.pageCount }}页
                </span>
                <span class="meta-item">
                  <el-icon><Picture /></el-icon>
                  {{ sheet.fileType === 'pdf' ? 'PDF' : '图片' }}
                </span>
              </div>
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
import { ArrowLeft, Document, Picture } from '@element-plus/icons-vue'
import { getSheetMusicListApi } from '@/api/sheetMusic'
import type { SheetMusic } from '@/types'

const router = useRouter()
const sheetMusic = ref<SheetMusic[]>([])

onMounted(() => {
  loadSheetMusic()
})

async function loadSheetMusic() {
  try {
    const data = await getSheetMusicListApi()
    sheetMusic.value = data
  } catch (error) {
    console.error('Load sheet music error:', error)
  }
}

function getDifficultyText(level: string) {
  const map: Record<string, string> = {
    bai_e: '拜厄',
    che_599: '车尔尼599',
    che_849: '车尔尼849',
    che_299: '车尔尼299',
    che_740: '车尔尼740',
    beginner: '入门',
    elementary: '初级',
    intermediate: '中级',
    advanced: '高级'
  }
  return map[level] || level
}

function viewSheet(sheet: SheetMusic) {
  console.log('View sheet music:', sheet)
}
</script>

<style scoped>
.sheet-music-container {
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

.sheet-card {
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.sheet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.sheet-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.sheet-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sheet-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.sheet-badge.bai_e,
.sheet-badge.beginner {
  background: #67c23a;
}

.sheet-badge.che_599,
.sheet-badge.elementary {
  background: #409eff;
}

.sheet-badge.che_849,
.sheet-badge.intermediate {
  background: #e6a23c;
}

.sheet-badge.che_299,
.sheet-badge.che_740,
.sheet-badge.advanced {
  background: #f56c6c;
}

.sheet-info {
  padding: 12px;
}

.sheet-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sheet-composer {
  font-size: 13px;
  color: #909399;
  margin: 0 0 8px 0;
}

.sheet-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #606266;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
