<template>
  <div class="task-list">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="待分派" value="pending" />
            <el-option label="已分派" value="assigned" />
            <el-option label="进行中" value="inProgress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAssign">
            <el-icon><Plus /></el-icon>
            分派
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="taskNo" label="任务编号" width="180" />
        <el-table-column prop="entrustNo" label="委托编号" width="180" />
        <el-table-column prop="evidenceName" label="检材" min-width="180" show-overflow-tooltip />
        <el-table-column prop="appraiserName" label="鉴定人" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assignTime" label="分派时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              @click="handleStart(row)"
              :disabled="row.status !== 'assigned'"
            >启动</el-button>
            <el-button 
              type="success" 
              link 
              @click="handleComplete(row)"
              :disabled="row.status !== 'inProgress'"
            >完成</el-button>
            <el-button type="info" link @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog
      v-model="assignDialogVisible"
      title="分派任务"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="assignForm" :rules="assignRules" ref="assignFormRef" label-width="120px">
        <el-form-item label="选择委托" prop="entrustmentId">
          <el-select 
            v-model="assignForm.entrustmentId" 
            placeholder="请选择委托" 
            style="width: 100%" 
            filterable
            @change="handleEntrustmentChange"
          >
            <el-option
              v-for="item in entrustmentOptions"
              :key="item.id"
              :label="`${item.entrustNo} - ${item.caseName}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择检材" prop="evidenceId">
          <el-select 
            v-model="assignForm.evidenceId" 
            placeholder="请选择检材" 
            style="width: 100%" 
            filterable
            :disabled="!assignForm.entrustmentId"
          >
            <el-option
              v-for="item in evidenceOptions"
              :key="item.id"
              :label="`${item.evidenceNo} - ${item.name}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="鉴定人" prop="appraiserId">
          <el-select 
            v-model="assignForm.appraiserId" 
            placeholder="请选择鉴定人" 
            style="width: 100%" 
            filterable
          >
            <el-option
              v-for="item in appraiserOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="助理" prop="assistantId">
          <el-select 
            v-model="assignForm.assistantId" 
            placeholder="请选择助理" 
            style="width: 100%" 
            filterable
            clearable
          >
            <el-option
              v-for="item in assistantOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input
            v-model="assignForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleAssignSubmit">确定分派</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewVisible" title="任务详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务编号">{{ currentRow.taskNo }}</el-descriptions-item>
        <el-descriptions-item label="委托编号">{{ currentRow.entrustNo }}</el-descriptions-item>
        <el-descriptions-item label="检材" :span="2">{{ currentRow.evidenceName }}</el-descriptions-item>
        <el-descriptions-item label="鉴定人">{{ currentRow.appraiserName }}</el-descriptions-item>
        <el-descriptions-item label="助理">{{ currentRow.assistantName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRow.status)">{{ getStatusText(currentRow.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="分派时间">{{ currentRow.assignTime }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentRow.startTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ currentRow.completeTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="任务描述" :span="2">{{ currentRow.description || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { getTaskList, createTask, startTask, completeTask } from '@/api/task'
import { getEntrustmentList } from '@/api/entrustment'
import { getEvidenceList } from '@/api/evidence'

const loading = ref(false)
const submitLoading = ref(false)
const assignDialogVisible = ref(false)
const viewVisible = ref(false)
const currentRow = ref({})
const assignFormRef = ref(null)

const searchForm = reactive({
  status: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])
const entrustmentOptions = ref([])
const evidenceOptions = ref([])
const appraiserOptions = ref([
  { id: 1, name: '张鉴定师' },
  { id: 2, name: '李鉴定师' },
  { id: 3, name: '王鉴定师' }
])
const assistantOptions = ref([
  { id: 1, name: '刘助理' },
  { id: 2, name: '陈助理' },
  { id: 3, name: '赵助理' }
])

const assignForm = reactive({
  entrustmentId: null,
  evidenceId: null,
  appraiserId: null,
  assistantId: null,
  description: ''
})

const assignRules = {
  entrustmentId: [{ required: true, message: '请选择委托', trigger: 'change' }],
  evidenceId: [{ required: true, message: '请选择检材', trigger: 'change' }],
  appraiserId: [{ required: true, message: '请选择鉴定人', trigger: 'change' }]
}

const statusMap = {
  pending: { text: '待分派', type: 'info' },
  assigned: { text: '已分派', type: 'primary' },
  inProgress: { text: '进行中', type: 'warning' },
  completed: { text: '已完成', type: 'success' }
}

const getStatusText = (status) => statusMap[status]?.text || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    const res = await getTaskList(params)
    if (res.code === 200) {
      tableData.value = res.data?.list || []
      pagination.total = res.data?.total || 0
    }
  } catch (error) {
    console.error('获取列表失败', error)
  } finally {
    loading.value = false
  }
}

const fetchEntrustmentOptions = async () => {
  try {
    const res = await getEntrustmentList({ pageSize: 100, pageNum: 1 })
    if (res.code === 200) {
      entrustmentOptions.value = res.data?.list || []
    }
  } catch (error) {
    console.error('获取委托列表失败', error)
  }
}

const fetchEvidenceOptions = async (entrustmentId) => {
  try {
    const res = await getEvidenceList({ entrustmentId, pageSize: 100, pageNum: 1 })
    if (res.code === 200) {
      evidenceOptions.value = res.data?.list || []
    }
  } catch (error) {
    console.error('获取检材列表失败', error)
  }
}

const handleEntrustmentChange = (val) => {
  assignForm.evidenceId = null
  evidenceOptions.value = []
  if (val) {
    fetchEvidenceOptions(val)
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchList()
}

const handleReset = () => {
  searchForm.status = ''
  handleSearch()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  fetchList()
}

const handleCurrentChange = (page) => {
  pagination.pageNum = page
  fetchList()
}

const resetAssignForm = () => {
  assignForm.entrustmentId = null
  assignForm.evidenceId = null
  assignForm.appraiserId = null
  assignForm.assistantId = null
  assignForm.description = ''
  evidenceOptions.value = []
  if (assignFormRef.value) {
    assignFormRef.value.resetFields()
  }
}

const handleAssign = () => {
  resetAssignForm()
  fetchEntrustmentOptions()
  assignDialogVisible.value = true
}

const handleAssignSubmit = async () => {
  if (!assignFormRef.value) return
  try {
    await assignFormRef.value.validate()
    submitLoading.value = true
    const res = await createTask(assignForm)
    if (res.code === 200) {
      ElMessage.success('分派成功')
      assignDialogVisible.value = false
      fetchList()
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

const handleStart = (row) => {
  ElMessageBox.confirm('确定要启动该任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await startTask(row.id)
      if (res.code === 200) {
        ElMessage.success('启动成功')
        fetchList()
      }
    } catch (error) {
      console.error('启动失败', error)
    }
  }).catch(() => {})
}

const handleComplete = (row) => {
  ElMessageBox.confirm('确定要完成该任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await completeTask(row.id, {})
      if (res.code === 200) {
        ElMessage.success('完成成功')
        fetchList()
      }
    } catch (error) {
      console.error('完成失败', error)
    }
  }).catch(() => {})
}

const handleView = (row) => {
  currentRow.value = row
  viewVisible.value = true
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.task-list {
  padding: 0;
}

.search-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
