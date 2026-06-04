<template>
  <div class="processing-record-list">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="批次">
          <el-select v-model="searchForm.batchId" placeholder="请选择批次" clearable>
            <el-option label="HB202409001" value="1" />
            <el-option label="HB202409002" value="2" />
            <el-option label="HB202409003" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="工序类型">
          <el-select v-model="searchForm.stepType" placeholder="请选择工序类型" clearable>
            <el-option label="清洗" value="1" />
            <el-option label="烘干" value="2" />
            <el-option label="切片" value="3" />
            <el-option label="炮制" value="4" />
            <el-option label="筛选" value="5" />
            <el-option label="包装" value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="searchForm.operator" placeholder="请输入操作人" clearable />
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
        <el-table-column prop="batchNo" label="批次号" width="160" />
        <el-table-column prop="stepType" label="工序类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getStepTypeTagType(row.stepType)">
              {{ getStepTypeText(row.stepType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="endTime" label="结束时间" width="160" />
        <el-table-column prop="duration" label="时长(分钟)" width="120" />
        <el-table-column prop="temperature" label="温度(℃)" width="100" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="inputQuantity" label="投入量(kg)" width="120" />
        <el-table-column prop="outputQuantity" label="产出量(kg)" width="120" />
        <el-table-column prop="qualityResult" label="质检结果" width="100">
          <template #default="{ row }">
            <el-tag :type="getQualityTagType(row.qualityResult)">
              {{ getQualityResultText(row.qualityResult) }}
            </el-tag>
          </template>
        </el-table-column>
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

    <ProcessingRecordForm
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
import ProcessingRecordForm from './ProcessingRecordForm.vue'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('add')
const currentRow = ref(null)

const searchForm = reactive({
  batchId: '',
  stepType: '',
  operator: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: 'PR202409001',
    batchId: '1',
    batchNo: 'HB202409001',
    stepType: '1',
    startTime: '2024-09-16 08:00:00',
    endTime: '2024-09-16 10:30:00',
    duration: 150,
    temperature: 25,
    operator: '赵六',
    inputQuantity: 1200,
    outputQuantity: 1180,
    qualityResult: 1,
    qualityRemark: '清洗干净，无杂质'
  },
  {
    id: 'PR202409002',
    batchId: '1',
    batchNo: 'HB202409001',
    stepType: '2',
    startTime: '2024-09-16 11:00:00',
    endTime: '2024-09-16 15:00:00',
    duration: 240,
    temperature: 60,
    operator: '钱七',
    inputQuantity: 1180,
    outputQuantity: 350,
    qualityResult: 1,
    qualityRemark: '烘干均匀，水分含量达标'
  },
  {
    id: 'PR202409003',
    batchId: '2',
    batchNo: 'HB202409002',
    stepType: '1',
    startTime: '2024-09-21 09:00:00',
    endTime: '2024-09-21 11:00:00',
    duration: 120,
    temperature: 25,
    operator: '孙八',
    inputQuantity: 850,
    outputQuantity: 830,
    qualityResult: 0,
    qualityRemark: '部分产品有破损，需返工'
  }
])

const getStepTypeText = (type) => {
  const typeMap = { 1: '清洗', 2: '烘干', 3: '切片', 4: '炮制', 5: '筛选', 6: '包装' }
  return typeMap[type] || '未知'
}

const getStepTypeTagType = (type) => {
  const typeMap = { 1: 'primary', 2: 'warning', 3: 'success', 4: 'danger', 5: 'info', 6: '' }
  return typeMap[type] || 'info'
}

const getQualityResultText = (result) => {
  const resultMap = { 0: '不合格', 1: '合格' }
  return resultMap[result] || '未知'
}

const getQualityTagType = (result) => {
  const typeMap = { 0: 'danger', 1: 'success' }
  return typeMap[result] || 'info'
}

const fetchData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = 40
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.batchId = ''
  searchForm.stepType = ''
  searchForm.operator = ''
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
.processing-record-list {
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
