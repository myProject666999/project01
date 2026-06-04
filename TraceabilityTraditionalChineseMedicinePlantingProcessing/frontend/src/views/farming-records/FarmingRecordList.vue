<template>
  <div class="farming-record-list">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="地块">
          <el-select v-model="searchForm.plotId" placeholder="请选择地块" clearable>
            <el-option label="东北人参种植基地A区" value="P2024001" />
            <el-option label="云南三七种植基地" value="P2024002" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.operationType" placeholder="请选择操作类型" clearable>
            <el-option label="播种" value="1" />
            <el-option label="施肥" value="2" />
            <el-option label="浇水" value="3" />
            <el-option label="除草" value="4" />
            <el-option label="打农药" value="5" />
            <el-option label="修剪" value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
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
          新增记录
        </el-button>
      </div>
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="记录编号" width="140" />
        <el-table-column prop="plotName" label="地块" width="180" />
        <el-table-column prop="operationType" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getOperationTypeTagType(row.operationType)">
              {{ getOperationTypeText(row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationDate" label="操作日期" width="120" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column label="肥料/农药详情" min-width="200">
          <template #default="{ row }">
            <div v-if="row.fertilizerName">
              <span>肥料: {{ row.fertilizerName }}</span>
              <span v-if="row.fertilizerDosage"> ({{ row.fertilizerDosage }})</span>
            </div>
            <div v-if="row.pesticideName">
              <span>农药: {{ row.pesticideName }}</span>
              <span v-if="row.pesticideDosage"> ({{ row.pesticideDosage }})</span>
            </div>
            <span v-if="!row.fertilizerName && !row.pesticideName">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="operationDetail" label="操作详情" min-width="200" show-overflow-tooltip />
        <el-table-column prop="weather" label="天气" width="100" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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

    <FarmingRecordForm
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :data="currentRow"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import FarmingRecordForm from './FarmingRecordForm.vue'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('add')
const currentRow = ref(null)

const searchForm = reactive({
  plotId: '',
  operationType: '',
  dateRange: []
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: 'FR202404001',
    plotId: 'P2024001',
    plotName: '东北人参种植基地A区',
    operationType: '2',
    operationDate: '2024-04-20',
    operator: '张三',
    fertilizerName: '有机肥',
    fertilizerDosage: '50kg/亩',
    pesticideName: '',
    pesticideDosage: '',
    operationDetail: '对地块进行首次施肥，采用根部施肥方式，施肥后及时浇水',
    weather: '晴'
  },
  {
    id: 'FR202405002',
    plotId: 'P2024001',
    plotName: '东北人参种植基地A区',
    operationType: '3',
    operationDate: '2024-05-10',
    operator: '李四',
    fertilizerName: '',
    fertilizerDosage: '',
    pesticideName: '',
    pesticideDosage: '',
    operationDetail: '采用滴灌方式浇水，持续3小时，土壤湿度达到60%',
    weather: '多云'
  },
  {
    id: 'FR202405003',
    plotId: 'P2024002',
    plotName: '云南三七种植基地',
    operationType: '5',
    operationDate: '2024-05-15',
    operator: '王五',
    fertilizerName: '',
    fertilizerDosage: '',
    pesticideName: '多菌灵',
    pesticideDosage: '1000倍液喷施',
    operationDetail: '防治根腐病，全株均匀喷施，7天后再喷一次',
    weather: '阴'
  }
])

const getOperationTypeText = (type) => {
  const typeMap = { 1: '播种', 2: '施肥', 3: '浇水', 4: '除草', 5: '打农药', 6: '修剪' }
  return typeMap[type] || '未知'
}

const getOperationTypeTagType = (type) => {
  const typeMap = { 1: 'success', 2: 'warning', 3: 'primary', 4: 'info', 5: 'danger', 6: '' }
  return typeMap[type] || 'info'
}

const fetchData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = 50
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
  searchForm.operationType = ''
  searchForm.dateRange = []
  handleSearch()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRow.value = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogMode.value = 'edit'
  currentRow.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除记录【${row.id}】吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
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
.farming-record-list {
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
