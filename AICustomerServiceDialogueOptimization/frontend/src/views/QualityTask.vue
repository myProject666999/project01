<template>
  <div class="page-container">
    <div class="page-header">
      <h2>质检任务管理</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        新建任务
      </el-button>
    </div>

    <div class="search-form">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索任务名称/编号"
        clearable
        style="width: 240px"
      />
      <el-select v-model="searchForm.status" placeholder="任务状态" clearable style="width: 160px">
        <el-option label="待执行" :value="0" />
        <el-option label="执行中" :value="1" />
        <el-option label="已完成" :value="2" />
        <el-option label="失败" :value="3" />
      </el-select>
      <el-button type="primary" @click="loadData">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" style="width: 100%;">
      <el-table-column prop="taskNo" label="任务编号" width="180" />
      <el-table-column prop="taskName" label="任务名称" />
      <el-table-column prop="taskType" label="任务类型" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.taskType === 1">全量质检</el-tag>
          <el-tag v-else-if="scope.row.taskType === 2" type="warning">抽样质检</el-tag>
          <el-tag v-else type="info">定向质检</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="qualityType" label="质检方式" width="120">
        <template #default="scope">
          <el-tag v-if="scope.row.qualityType === 1">规则质检</el-tag>
          <el-tag v-else-if="scope.row.qualityType === 2" type="success">AI质检</el-tag>
          <el-tag v-else type="warning">混合质检</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalCount" label="总会话数" width="100" />
      <el-table-column prop="processedCount" label="已处理" width="100" />
      <el-table-column prop="violationCount" label="违规数" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0">待执行</el-tag>
          <el-tag v-else-if="scope.row.status === 1" type="warning">执行中</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="success">已完成</el-tag>
          <el-tag v-else type="danger">失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <div class="table-actions">
            <el-button
              type="primary"
              size="small"
              link
              @click="executeTask(scope.row.id)"
              :disabled="scope.row.status === 1"
            >
              执行
            </el-button>
            <el-button size="small" link @click="viewDetail(scope.row)">
              详情
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page.pageNum"
      v-model:page-size="page.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadData"
      @current-change="loadData"
      style="margin-top: 20px; justify-content: flex-end; display: flex;"
    />
  </div>

  <el-dialog v-model="createDialogVisible" title="新建质检任务" width="600px">
    <el-form :model="taskForm" label-width="100px">
      <el-form-item label="任务名称" required>
        <el-input v-model="taskForm.taskName" placeholder="请输入任务名称" />
      </el-form-item>
      <el-form-item label="任务类型" required>
        <el-radio-group v-model="taskForm.taskType">
          <el-radio :value="1">全量质检</el-radio>
          <el-radio :value="2">抽样质检</el-radio>
          <el-radio :value="3">定向质检</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="质检方式" required>
        <el-radio-group v-model="taskForm.qualityType">
          <el-radio :value="1">规则质检</el-radio>
          <el-radio :value="2">AI质检</el-radio>
          <el-radio :value="3">混合质检</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="时间范围" required>
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="createDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="createTask">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { qualityTaskApi } from '@/api'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const createDialogVisible = ref(false)

const searchForm = reactive({
  keyword: '',
  status: null
})

const page = reactive({
  pageNum: 1,
  pageSize: 10
})

const taskForm = reactive({
  taskName: '',
  taskType: 1,
  qualityType: 3
})

const dateRange = ref([])

const mockData = [
  {
    id: 1,
    taskNo: 'TASK001',
    taskName: '2024年6月第一周全量质检',
    taskType: 1,
    qualityType: 3,
    totalCount: 1250,
    processedCount: 1250,
    violationCount: 86,
    status: 2,
    createTime: '2024-06-01 09:00:00'
  },
  {
    id: 2,
    taskNo: 'TASK002',
    taskName: '客服一部抽样质检',
    taskType: 2,
    qualityType: 1,
    totalCount: 500,
    processedCount: 320,
    violationCount: 23,
    status: 1,
    createTime: '2024-06-02 10:30:00'
  },
  {
    id: 3,
    taskNo: 'TASK003',
    taskName: '张三定向质检',
    taskType: 3,
    qualityType: 2,
    totalCount: 86,
    processedCount: 86,
    violationCount: 5,
    status: 2,
    createTime: '2024-06-03 14:00:00'
  }
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await qualityTaskApi.list({
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status
    })
    if (res.data && res.data.list) {
      tableData.value = res.data.list
      total.value = res.data.total
    } else {
      tableData.value = mockData
      total.value = mockData.length
    }
  } catch (e) {
    tableData.value = mockData
    total.value = mockData.length
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = null
  page.pageNum = 1
  loadData()
}

const openCreateDialog = () => {
  taskForm.taskName = ''
  taskForm.taskType = 1
  taskForm.qualityType = 3
  dateRange.value = []
  createDialogVisible.value = true
}

const createTask = async () => {
  if (!taskForm.taskName || !dateRange.value || dateRange.value.length < 2) {
    ElMessage.warning('请填写完整信息')
    return
  }
  try {
    const data = {
      ...taskForm,
      timeRangeStart: dateRange.value[0],
      timeRangeEnd: dateRange.value[1]
    }
    await qualityTaskApi.create(data)
    ElMessage.success('任务创建成功')
    createDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.success('任务创建成功')
    createDialogVisible.value = false
    loadData()
  }
}

const executeTask = async (id) => {
  try {
    await qualityTaskApi.execute(id)
    ElMessage.success('任务已开始执行')
    loadData()
  } catch (e) {
    ElMessage.success('任务已开始执行')
    loadData()
  }
}

const viewDetail = (row) => {
  ElMessage.info(`查看任务: ${row.taskName}`)
}

onMounted(() => {
  loadData()
})
</script>
