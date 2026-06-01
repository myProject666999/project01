<template>
  <div class="case-board">
    <el-row :gutter="20" class="statistics-row">
      <el-col :span="6" v-for="(item, key) in statusStatistics" :key="key">
        <el-card class="stat-card" :body-style="{ padding: '20px' }">
          <div class="stat-content">
            <div class="stat-label">{{ item.label }}</div>
            <div class="stat-value">{{ item.value }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="board-card">
      <template #header>
        <div class="card-header">
          <span>案件看板</span>
          <el-button type="primary" @click="showCreateDialog">
            <el-icon><Plus /></el-icon>
            新建案件
          </el-button>
        </div>
      </template>

      <el-table :data="cases" border stripe style="width: 100%">
        <el-table-column prop="caseNumber" label="案件编号" width="140" />
        <el-table-column prop="caseName" label="案件名称" min-width="200" />
        <el-table-column prop="caseType" label="案件类型" width="100">
          <template #default="{ row }">
            {{ getCaseTypeLabel(row.caseType) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="140">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="court" label="受理法院" width="180" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewDetail(row.id)">
              查看详情
            </el-button>
            <el-dropdown @command="(status) => updateStatus(row.id, status)">
              <el-button size="small">
                状态流转<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-for="status in allowedStatuses"
                    :key="status.value"
                    :command="status.value"
                  >
                    {{ status.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="createDialogVisible"
      title="新建案件"
      width="600px"
    >
      <el-form :model="newCase" label-width="100px">
        <el-form-item label="案件名称">
          <el-input v-model="newCase.caseName" placeholder="请输入案件名称" />
        </el-form-item>
        <el-form-item label="案件类型">
          <el-select v-model="newCase.caseType" placeholder="请选择案件类型">
            <el-option label="民事" :value="1" />
            <el-option label="刑事" :value="2" />
            <el-option label="行政" :value="3" />
            <el-option label="仲裁" :value="4" />
            <el-option label="其他" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="受理法院">
          <el-input v-model="newCase.court" placeholder="请输入受理法院" />
        </el-form-item>
        <el-form-item label="案件描述">
          <el-input
            v-model="newCase.caseDescription"
            type="textarea"
            :rows="4"
            placeholder="请输入案件描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createCase">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { caseApi } from '../api'

const router = useRouter()
const cases = ref([])
const statusStatistics = ref({})
const createDialogVisible = ref(false)
const newCase = ref({
  caseName: '',
  caseType: 1,
  court: '',
  caseDescription: ''
})

const allowedStatuses = [
  { value: 'ACCEPTED', label: '接受委托' },
  { value: 'FILING', label: '立案中' },
  { value: 'FILED', label: '已立案' },
  { value: 'HEARING', label: '庭审中' },
  { value: 'JUDGED', label: '已判决' },
  { value: 'EXECUTION', label: '执行中' },
  { value: 'CLOSED', label: '已结案' },
  { value: 'ARCHIVED', label: '已归档' }
]

const statusLabels = {
  CONSULTATION: '咨询接洽',
  ACCEPTED: '已接受委托',
  FILING: '立案中',
  FILED: '已立案',
  HEARING: '庭审中',
  JUDGED: '已判决',
  EXECUTION: '执行中',
  CLOSED: '已结案',
  ARCHIVED: '已归档'
}

const getStatusLabel = (status) => statusLabels[status] || status

const getStatusTagType = (status) => {
  const types = {
    CONSULTATION: 'info',
    ACCEPTED: '',
    FILING: 'warning',
    FILED: 'primary',
    HEARING: 'danger',
    JUDGED: 'success',
    EXECUTION: 'warning',
    CLOSED: 'info',
    ARCHIVED: 'success'
  }
  return types[status] || 'info'
}

const getCaseTypeLabel = (type) => {
  const types = { 1: '民事', 2: '刑事', 3: '行政', 4: '仲裁', 5: '其他' }
  return types[type] || '未知'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const loadCases = async () => {
  try {
    const data = await caseApi.getAll()
    cases.value = data
  } catch (error) {
    console.error('加载案件列表失败:', error)
  }
}

const loadStatistics = async () => {
  try {
    const data = await caseApi.getStatistics()
    const allLabels = {
      CONSULTATION: '咨询接洽',
      ACCEPTED: '已接受',
      FILING: '立案中',
      FILED: '已立案',
      HEARING: '庭审中',
      JUDGED: '已判决',
      EXECUTION: '执行中',
      CLOSED: '已结案',
      ARCHIVED: '已归档'
    }
    statusStatistics.value = Object.keys(allLabels).reduce((acc, key) => {
      acc[key] = {
        label: allLabels[key],
        value: data[key] || 0
      }
      return acc
    }, {})
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const showCreateDialog = () => {
  createDialogVisible.value = true
}

const createCase = async () => {
  try {
    await caseApi.create(newCase.value)
    ElMessage.success('案件创建成功')
    createDialogVisible.value = false
    loadCases()
    loadStatistics()
    newCase.value = { caseName: '', caseType: 1, court: '', caseDescription: '' }
  } catch (error) {
    ElMessage.error('案件创建失败')
  }
}

const viewDetail = (id) => {
  router.push(`/case-detail/${id}`)
}

const updateStatus = async (id, newStatus) => {
  try {
    await caseApi.updateStatus(id, newStatus, '手动更新')
    ElMessage.success('状态更新成功')
    loadCases()
    loadStatistics()
  } catch (error) {
    ElMessage.error('状态更新失败: ' + (error.response?.data || '非法状态跳转'))
  }
}

onMounted(() => {
  loadCases()
  loadStatistics()
})
</script>

<style scoped>
.case-board {
  padding: 0;
}

.statistics-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #409eff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
