<template>
  <div class="harvest-batch-list">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="地块">
          <el-select v-model="searchForm.plotId" placeholder="请选择地块" clearable>
            <el-option label="东北人参种植基地A区" value="P2024001" />
            <el-option label="云南三七种植基地" value="P2024002" />
          </el-select>
        </el-form-item>
        <el-form-item label="品种">
          <el-select v-model="searchForm.variety" placeholder="请选择品种" clearable>
            <el-option label="人参" value="人参" />
            <el-option label="三七" value="三七" />
            <el-option label="当归" value="当归" />
          </el-select>
        </el-form-item>
        <el-form-item label="采收日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="安全检查">
          <el-select v-model="searchForm.safetyCheckStatus" placeholder="请选择检查状态" clearable>
            <el-option label="通过" value="1" />
            <el-option label="不通过" value="0" />
            <el-option label="待检查" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <div class="table-header">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增批次
        </el-button>
      </div>
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="batchNo" label="批次号" width="160" />
        <el-table-column prop="plotName" label="地块" width="180" />
        <el-table-column prop="variety" label="品种" width="100" />
        <el-table-column prop="harvestDate" label="采收日期" width="120" />
        <el-table-column prop="harvestQuantity" label="采收量(kg)" width="120" />
        <el-table-column prop="qualityGrade" label="质量等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getQualityTagType(row.qualityGrade)">
              {{ row.qualityGrade }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="safetyCheckStatus" label="安全检查" width="100">
          <template #default="{ row }">
            <el-tag :type="getSafetyTagType(row.safetyCheckStatus)">
              {{ getSafetyStatusText(row.safetyCheckStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </el-card>

    <HarvestBatchForm
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :data="currentRow"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import HarvestBatchForm from './HarvestBatchForm.vue'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('add')
const currentRow = ref(null)

const searchForm = reactive({
  plotId: '',
  variety: '',
  dateRange: [],
  safetyCheckStatus: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: 1,
    batchNo: 'HB202409001',
    plotId: 'P2024001',
    plotName: '东北人参种植基地A区',
    variety: '人参',
    harvestDate: '2024-09-15',
    harvestQuantity: 1200,
    qualityGrade: '一级',
    safetyCheckStatus: 1,
    status: 1,
    harvestMethod: '人工采收',
    weather: '晴',
    manager: '张三'
  },
  {
    id: 2,
    batchNo: 'HB202409002',
    plotId: 'P2024002',
    plotName: '云南三七种植基地',
    variety: '三七',
    harvestDate: '2024-09-20',
    harvestQuantity: 850,
    qualityGrade: '二级',
    safetyCheckStatus: 0,
    status: 0,
    harvestMethod: '人工采收',
    weather: '多云',
    manager: '李四'
  },
  {
    id: 3,
    batchNo: 'HB202409003',
    plotId: 'P2024001',
    plotName: '东北人参种植基地A区',
    variety: '人参',
    harvestDate: '2024-09-25',
    harvestQuantity: 2100,
    qualityGrade: '一级',
    safetyCheckStatus: 2,
    status: 0,
    harvestMethod: '机械采收',
    weather: '晴',
    manager: '王五'
  }
])

const getSafetyStatusText = (status) => {
  const statusMap = { 0: '不通过', 1: '通过', 2: '待检查' }
  return statusMap[status] || '未知'
}

const getSafetyTagType = (status) => {
  const typeMap = { 0: 'danger', 1: 'success', 2: 'warning' }
  return typeMap[status] || 'info'
}

const getQualityTagType = (grade) => {
  const typeMap = { '一级': 'success', '二级': 'primary', '三级': 'warning' }
  return typeMap[grade] || 'info'
}

const getStatusText = (status) => {
  const statusMap = { 0: '待加工', 1: '加工中', 2: '已完成' }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status) => {
  const typeMap = { 0: 'info', 1: 'primary', 2: 'success' }
  return typeMap[status] || 'info'
}

const fetchData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = 30
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.plotId = ''
  searchForm.variety = ''
  searchForm.dateRange = []
  searchForm.safetyCheckStatus = ''
  handleSearch()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRow.value = null
  dialogVisible.value = true
}

const handleView = (row) => {
  dialogMode.value = 'view'
  currentRow.value = { ...row }
  dialogVisible.value = true
}

const handleSuccess = () => {
  dialogVisible.value = false
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.harvest-batch-list {
  padding: 20px;
}
.search-card {
  margin-bottom: 20px;
}
.search-form {
  display: flex;
  flex-wrap: wrap;
}
.table-header {
  margin-bottom: 16px;
}
.pagination {
  margin-top: 20px;
  justify-content: flex-end;
  display: flex;
}
</style>
