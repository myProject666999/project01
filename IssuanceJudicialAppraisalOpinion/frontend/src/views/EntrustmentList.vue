<template>
  <div class="entrustment-list">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="案件名称">
          <el-input
            v-model="searchForm.caseName"
            placeholder="请输入案件名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="待受理" value="pending" />
            <el-option label="已受理" value="accepted" />
            <el-option label="进行中" value="inProgress" />
            <el-option label="已完成" value="completed" />
            <el-option label="待复核" value="pendingReview" />
            <el-option label="已复核" value="reviewed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="entrustNo" label="委托编号" width="180" />
        <el-table-column prop="caseName" label="案件名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="appraisalType" label="鉴定类型" width="150" />
        <el-table-column prop="entrustor" label="委托人" width="150" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="entrustDate" label="委托日期" width="150" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="warning" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="委托编号" prop="entrustNo">
              <el-input v-model="form.entrustNo" :disabled="isEdit" placeholder="自动生成" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="委托日期" prop="entrustDate">
              <el-date-picker
                v-model="form.entrustDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="案件名称" prop="caseName">
          <el-input v-model="form.caseName" placeholder="请输入案件名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="鉴定类型" prop="appraisalType">
              <el-select v-model="form.appraisalType" placeholder="请选择鉴定类型" style="width: 100%">
                <el-option label="法医病理鉴定" value="法医病理鉴定" />
                <el-option label="法医临床鉴定" value="法医临床鉴定" />
                <el-option label="文书鉴定" value="文书鉴定" />
                <el-option label="痕迹鉴定" value="痕迹鉴定" />
                <el-option label="物证鉴定" value="物证鉴定" />
                <el-option label="声像资料鉴定" value="声像资料鉴定" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="委托人" prop="entrustor">
              <el-input v-model="form.entrustor" placeholder="请输入委托人" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="案情摘要" prop="caseSummary">
          <el-input
            v-model="form.caseSummary"
            type="textarea"
            :rows="3"
            placeholder="请输入案情摘要"
          />
        </el-form-item>
        <el-form-item label="鉴定要求" prop="appraisalRequirements">
          <el-input
            v-model="form.appraisalRequirements"
            type="textarea"
            :rows="3"
            placeholder="请输入鉴定要求"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewVisible" title="委托详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="委托编号">{{ currentRow.entrustNo }}</el-descriptions-item>
        <el-descriptions-item label="委托日期">{{ currentRow.entrustDate }}</el-descriptions-item>
        <el-descriptions-item label="案件名称" :span="2">{{ currentRow.caseName }}</el-descriptions-item>
        <el-descriptions-item label="鉴定类型">{{ currentRow.appraisalType }}</el-descriptions-item>
        <el-descriptions-item label="委托人">{{ currentRow.entrustor }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentRow.phone }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRow.status)">{{ getStatusText(currentRow.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="案情摘要" :span="2">{{ currentRow.caseSummary }}</el-descriptions-item>
        <el-descriptions-item label="鉴定要求" :span="2">{{ currentRow.appraisalRequirements }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import {
  getEntrustmentList,
  createEntrustment,
  updateEntrustment,
  deleteEntrustment
} from '@/api/entrustment'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const viewVisible = ref(false)
const isEdit = ref(false)
const currentRow = ref({})
const formRef = ref(null)

const searchForm = reactive({
  caseName: '',
  status: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const form = reactive({
  id: null,
  entrustNo: '',
  caseName: '',
  appraisalType: '',
  entrustor: '',
  phone: '',
  entrustDate: '',
  caseSummary: '',
  appraisalRequirements: '',
  status: 'pending'
})

const rules = {
  caseName: [{ required: true, message: '请输入案件名称', trigger: 'blur' }],
  appraisalType: [{ required: true, message: '请选择鉴定类型', trigger: 'change' }],
  entrustor: [{ required: true, message: '请输入委托人', trigger: 'blur' }],
  entrustDate: [{ required: true, message: '请选择委托日期', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑委托' : '新增委托')

const statusMap = {
  pending: { text: '待受理', type: 'info' },
  accepted: { text: '已受理', type: 'primary' },
  inProgress: { text: '进行中', type: 'warning' },
  completed: { text: '已完成', type: 'success' },
  pendingReview: { text: '待复核', type: 'danger' },
  reviewed: { text: '已复核', type: 'success' }
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
    const res = await getEntrustmentList(params)
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

const handleSearch = () => {
  pagination.pageNum = 1
  fetchList()
}

const handleReset = () => {
  searchForm.caseName = ''
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

const resetForm = () => {
  form.id = null
  form.entrustNo = ''
  form.caseName = ''
  form.appraisalType = ''
  form.entrustor = ''
  form.phone = ''
  form.entrustDate = ''
  form.caseSummary = ''
  form.appraisalRequirements = ''
  form.status = 'pending'
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleView = (row) => {
  currentRow.value = row
  viewVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该委托吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteEntrustment(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchList()
      }
    } catch (error) {
      console.error('删除失败', error)
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitLoading.value = true
    let res
    if (isEdit.value) {
      res = await updateEntrustment(form.id, form)
    } else {
      res = await createEntrustment(form)
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
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

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.entrustment-list {
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
