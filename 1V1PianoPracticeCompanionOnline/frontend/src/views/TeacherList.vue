<template>
  <div class="teacher-list-container">
    <el-header class="header">
      <div class="back-btn" @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </div>
      <h2 class="page-title">选择老师</h2>
      <div class="header-right"></div>
    </el-header>

    <el-main class="main-content">
      <el-card class="filter-card card-shadow">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="曲目难度">
            <el-select v-model="filterForm.difficulty" placeholder="全部" clearable style="width: 180px">
              <el-option label="拜厄" value="beyer" />
              <el-option label="车尔尼599" value="czerny-599" />
              <el-option label="车尔尼849" value="czerny-849" />
              <el-option label="车尔尼299" value="czerny-299" />
              <el-option label="哈农" value="hanon" />
              <el-option label="巴赫初级" value="bach-beginner" />
            </el-select>
          </el-form-item>
          <el-form-item label="教学语言">
            <el-switch v-model="filterForm.teachChinese" active-text="中文教学" inactive-text="不限" />
          </el-form-item>
          <el-form-item label="搜索">
            <el-input v-model="filterForm.keyword" placeholder="输入老师姓名" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchTeachers">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-row :gutter="20" class="teacher-cards">
        <el-col :span="8" v-for="teacher in teachers" :key="teacher.id">
          <el-card class="teacher-card card-shadow" hoverable @click="goToBooking(teacher.id)">
            <div class="teacher-header">
              <el-avatar :size="80" :src="teacher.user?.avatarUrl">
                {{ teacher.user?.name?.charAt(0) }}
              </el-avatar>
              <div class="teacher-basic">
                <h3 class="teacher-name">{{ teacher.user?.name }}</h3>
                <div class="teacher-tags">
                  <el-tag v-if="teacher.chineseTeaching" type="success" size="small">中文教学</el-tag>
                  <el-tag type="info" size="small">
                    <el-rate :model-value="teacher.rating" disabled :max="5" show-score text-color="#ff9900" />
                  </el-tag>
                </div>
              </div>
            </div>
            <div class="teacher-info">
              <p class="teacher-intro">{{ teacher.bio || '暂无介绍' }}</p>
              <div class="difficulty-levels">
                <span class="label">擅长：</span>
                <el-tag
                  v-for="(skill, index) in teacher.skills"
                  :key="index"
                  size="small"
                  type="info"
                  class="difficulty-tag"
                >
                  {{ getDifficultyText(skill.difficultyLevel) }}
                </el-tag>
              </div>
            </div>
            <div class="teacher-footer">
              <span class="price">¥{{ teacher.hourlyRate }}/小时</span>
              <span class="review-count">{{ teacher.totalLessons }}节课</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="filterForm.page"
          v-model:page-size="filterForm.pageSize"
          :total="total"
          :page-sizes="[9, 18, 36]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="searchTeachers"
          @current-change="searchTeachers"
        />
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
import { getTeacherListApi } from '@/api/booking'
import type { Teacher, DifficultyLevel } from '@/types'

const router = useRouter()

const teachers = ref<Teacher[]>([])
const total = ref(0)

const filterForm = reactive({
  page: 1,
  pageSize: 9,
  difficulty: '',
  teachChinese: false,
  keyword: ''
})

onMounted(() => {
  searchTeachers()
})

async function searchTeachers() {
  try {
    const params = {
      page: filterForm.page,
      pageSize: filterForm.pageSize,
      ...(filterForm.difficulty && { difficulty: filterForm.difficulty as DifficultyLevel }),
      ...(filterForm.teachChinese && { teachChinese: true }),
      ...(filterForm.keyword && { keyword: filterForm.keyword })
    }
    const data = await getTeacherListApi(params)
    teachers.value = data.list
    total.value = data.total
  } catch (error) {
    console.error('Search teachers error:', error)
  }
}

function resetFilter() {
  filterForm.page = 1
  filterForm.pageSize = 9
  filterForm.difficulty = ''
  filterForm.teachChinese = false
  filterForm.keyword = ''
  searchTeachers()
}

function getDifficultyText(level: string) {
  const map: Record<string, string> = {
    bai_e: '拜厄',
    che_599: '车尔尼599',
    che_849: '车尔尼849',
    che_299: '车尔尼299',
    che_740: '车尔尼740',
    bach_beginner: '巴赫初级',
    bach_invention: '巴赫创意曲',
    mozart_sonata: '莫扎特奏鸣曲',
    beethoven_sonata: '贝多芬奏鸣曲',
    chopin_etude: '肖邦练习曲',
    liszt_etude: '李斯特练习曲',
    other: '其他',
    beginner: '入门',
    elementary: '初级',
    intermediate: '中级',
    advanced: '高级'
  }
  return map[level] || level
}

function goToBooking(teacherId: number) {
  router.push(`/booking/${teacherId}`)
}
</script>

<style scoped>
.teacher-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
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
  color: #606266;
  transition: color 0.3s;
}

.back-btn:hover {
  color: #409eff;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  width: 60px;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: #f5f7fa;
}

.filter-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.teacher-cards {
  margin-bottom: 20px;
}

.teacher-card {
  border-radius: 8px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.teacher-card:hover {
  transform: translateY(-4px);
}

.teacher-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.teacher-basic {
  flex: 1;
}

.teacher-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.teacher-tags {
  display: flex;
  gap: 8px;
  align-items: center;
}

.teacher-info {
  margin-bottom: 16px;
}

.teacher-intro {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.teacher-specialties,
.difficulty-levels {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.label {
  font-size: 14px;
  color: #909399;
}

.skill-tag,
.difficulty-tag {
  margin: 0;
}

.teacher-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.price {
  font-size: 20px;
  font-weight: 600;
  color: #f56c6c;
}

.review-count {
  font-size: 14px;
  color: #909399;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>
