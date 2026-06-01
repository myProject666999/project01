<template>
  <div class="inspection-list">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="任务ID">
          <el-input
            v-model="searchForm.taskId"
            placeholder="请输入任务ID"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="recordNo" label="记录编号" width="180" />
        <el-table-column prop="taskNo" label="任务" width="180" />
        <el-table-column prop="evidenceName" label="检材" min-width="180" show-overflow-tooltip />
        <el-table-column prop="inspectionDate" label="检验日期" width="150" />
        <el-table-column prop="appraiserName" label="鉴定人" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="success" link @click="handleAddRecord(row)">新增记录</el-button>
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
      v-model="addDialogVisible"
      title="新增检验记录"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="关联任务" prop="taskId">
              <el-select 
                v-model="addForm.taskId" 
                placeholder="请选择任务" 
                style="width: 100%" 
                filterable
                @change="handleTaskChange"
              >
                <el-option
                  v-for="item in taskOptions"
                  :key="item.id"
                  :label="`${item.taskNo} - ${item.evidenceName}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联检材" prop="evidenceId">
              <el-select 
                v-model="addForm.evidenceId" 
                placeholder="请选择检材" 
                style="width: 100%" 
                filterable
                :disabled="!addForm.taskId"
              >
                <el-option
                  v-for="item in evidenceOptions"
                  :key="item.id"
                  :label="`${item.evidenceNo} - ${item.name}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检验日期" prop="inspectionDate">
              <el-date-picker
                v-model="addForm.inspectionDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="鉴定人" prop="appraiserId">
              <el-select 
                v-model="addForm.appraiserId" 
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
          </el-col>
        </el-row>
        <el-form-item label="检验过程" prop="process">
          <el-input
            v-model="addForm.process"
            type="textarea"
            :rows="4"
            placeholder="请输入检验过程"
          />
        </el-form-item>
        <el-form-item label="检验结果" prop="result">
          <el-input
            v-model="addForm.result"
            type="textarea"
            :rows="4"
            placeholder="请输入检验结果"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="addForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleAddSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewVisible" title="检验记录详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="记录编号">{{ currentRow.recordNo }}</el-descriptions-item>
        <el-descriptions-item label="任务编号">{{ currentRow.taskNo }}</el-descriptions-item>
        <el-descriptions-item label="检材" :span="2">{{ currentRow.evidenceName }}</el-descriptions-item>
        <el-descriptions-item label="检验日期">{{ currentRow.inspectionDate }}</el-descriptions-item>
        <el-descriptions-item label="鉴定人">{{ currentRow.appraiserName }}</el-descriptions-item>
        <el-descriptions-item label="检验过程" :span="2">
          <div style="white-space: pre-wrap;">{{ currentRow.process }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="检验结果" :span="2">
          <div style="white-space: pre-wrap;">{{ currentRow.result }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          <div style="white-space: pre-wrap;">{{ currentRow.remark || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getInspectionList, addInspectionRecord, getInspectionRecords } from '@/api/inspection'
import { getTaskList } from '@/api/task'
import { getEvidenceList } from '@/api/evidence'

const loading = ref(false)
const submitLoading = ref(false)
const addDialogVisible = ref(false)
const viewVisible = ref(false)
const currentRow = ref({})
const addFormRef = ref(null)

const searchForm = reactive({
  taskId: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])
const taskOptions = ref([])
const evidenceOptions = ref([])
const appraiserOptions = ref([
  { id: 1, name: '张鉴定师' },
  { id: 2, name: '李鉴定师' },
  { id: 3, name: '王鉴定师' }
])

const addForm = reactive({
  taskId: null,
  evidenceId: null,
  inspectionDate: '',
  appraiserId: null,
  process: '',
  result: '',
  remark: ''
})

const addRules = {
  taskId: [{ required: true, message: '请选择任务', trigger: 'change' }],
  evidenceId: [{ required: true, message: '请选择检材', trigger: 'change' }],
  inspectionDate: [{ required: true, message: '请选择检验日期', trigger: 'change' }],
  appraiserId: [{ required: true, message: '请选择鉴定人', trigger: 'change' }],
  process: [{ required: true, message: '请输入检验过程', trigger: 'blur' }],
  result: [{ required: true, message: '请输入检验结果', trigger: 'blur' }]
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    const res = await getInspectionList(params)
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

const fetchTaskOptions = async () => {
  try {
    const res = await getTaskList({ pageSize: 100, pageNum: 1, status: 'inProgress' })
    if (res.code === 200) {
      taskOptions.value = res.data?.list || []
    }
  } catch (error) {
    console.error('获取任务列表失败', error)
  }
}

const fetchEvidenceOptions = async (taskId) => {
  try {
    const res = await getEvidenceList({ pageSize: 100, pageNum: 1 })
    if (res.code === 200) {
      evidenceOptions.value = res.data?.list || []
    }
  } catch (error) {
    console.error('获取检材列表失败', error)
  }
}

const handleTaskChange = (val) => {
  addForm.evidenceId = null
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
  searchForm.taskId = ''
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

const resetAddForm = () => {
  addForm.taskId = null
  addForm.evidenceId = null
  addForm.inspectionDate = ''
  addForm.appraiserId = null
  addForm.process = ''
  addForm.result = ''
  addForm.remark = ''
  evidenceOptions.value = []
  if (addFormRef.value) {
    addFormRef.value.resetFields()
  }
}

const handleAddRecord = (row) => {
  resetAddForm()
  if (row && row.taskId) {
    addForm.taskId = row.taskId
    fetchEvidenceOptions(row.taskId)
  }
  fetchTaskOptions()
  addDialogVisible.value = true
}

const handleAddSubmit = async () => {
  if (!addFormRef.value) return
  try {
    await addFormRef.value.validate()
    submitLoading.value = true
    const res = await addInspectionRecord(addForm.taskId, addForm)
    if (res.code === 200) {
      ElMessage.success('新增成功')
      addDialogVisible.value = false
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

const handleView = async (row) => {
  try {
    const res = await getInspectionRecords(row.id)
    if (res.code === 200) {
      currentRow.value = { ...row, ...(res.data?.[0] || {}) }
    } else {
      currentRow.value = row
    }
    viewVisible.value = true
  } catch (error) {
    currentRow.value = row
    viewVisible.value = true
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.inspection-list {
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
