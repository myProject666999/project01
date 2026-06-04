<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">盘点管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新建盘点
      </el-button>
    </div>

    <el-card>
      <div class="search-bar">
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 140px">
          <el-option label="待执行" value="待执行" />
          <el-option label="进行中" value="进行中" />
          <el-option label="已完成" value="已完成" />
        </el-select>
        <el-button type="primary" @click="loadData">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="resetSearch">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="plan_no" label="盘点编号" width="160" />
        <el-table-column prop="plan_name" label="盘点名称" min-width="180" />
        <el-table-column prop="location_scope" label="盘点范围" min-width="150" />
        <el-table-column prop="total_count" label="应盘点" width="100" />
        <el-table-column prop="checked_count" label="已盘点" width="100" />
        <el-table-column prop="missing_count" label="待查" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
            <el-button v-if="row.status === '待执行'" type="success" link size="small" @click="handleStart(row)">开始</el-button>
            <el-button v-if="row.status === '进行中'" type="warning" link size="small" @click="handleScan(row)">扫码盘点</el-button>
            <el-button v-if="row.status === '进行中'" type="danger" link size="small" @click="handleComplete(row)">完成</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :page-sizes="[20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="新建盘点计划"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="盘点名称" prop="plan_name">
          <el-input v-model="form.plan_name" />
        </el-form-item>
        <el-form-item label="盘点日期" prop="plan_date">
          <el-date-picker v-model="form.plan_date" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="盘点范围" prop="location_scope">
          <el-select v-model="form.location_scope" filterable style="width: 100%">
            <el-option v-for="loc in locations" :key="loc.id" :label="loc.name" :value="loc.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="form.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="scanDialogVisible"
      title="扫码盘点"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <el-form-item label="藏品编号">
          <el-input
            v-model="scanForm.collection_no"
            placeholder="扫描或输入藏品编号"
            @keyup.enter="handleScanSubmit"
            ref="scanInput"
          />
        </el-form-item>
        <el-form-item label="实际位置">
          <el-input v-model="scanForm.actual_location" placeholder="当前实际位置" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleScanSubmit" :loading="scanSubmitting">
            确认扫码
          </el-button>
        </el-form-item>
      </el-form>
      <el-divider />
      <div class="scan-history">
        <div class="scan-header">
          <span>已扫描藏品 ({{ scannedList.length }})</span>
          <el-button type="primary" link size="small" @click="handleBatchUpload">批量上传</el-button>
        </div>
        <div v-for="item in scannedList" :key="item" class="scan-item">
          <el-icon><CircleCheck /></el-icon>
          <span>{{ item }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {
  getInventoryPlans,
  createInventoryPlan,
  startInventory,
  completeInventory,
  checkInventoryItem,
  batchCheckInventory,
  getLocations
} from '@/api'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const scanSubmitting = ref(false)
const dialogVisible = ref(false)
const scanDialogVisible = ref(false)
const formRef = ref(null)
const scanInput = ref(null)
const locations = ref([])
const scannedList = ref([])
const currentPlanId = ref(null)

const searchForm = reactive({
  status: ''
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const tableData = ref([])

const form = reactive({
  plan_name: '',
  plan_date: null,
  location_scope: '',
  remarks: ''
})

const scanForm = reactive({
  collection_no: '',
  actual_location: ''
})

const formRules = {
  plan_name: [{ required: true, message: '请输入盘点名称', trigger: 'blur' }]
}

const getStatusTagType = (status) => {
  const types = {
    '待执行': 'info',
    '进行中': 'warning',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getInventoryPlans({
      page: pagination.page,
      page_size: pagination.page_size,
      status: searchForm.status
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.status = ''
  pagination.page = 1
  loadData()
}

const loadLocations = async () => {
  try {
    locations.value = await getLocations()
  } catch (err) {
    console.error(err)
  }
}

const handleAdd = () => {
  Object.assign(form, {
    plan_name: '',
    plan_date: null,
    location_scope: '',
    remarks: ''
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/inventory/${row.id}`)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await createInventoryPlan(form)
        ElMessage.success('创建成功')
        dialogVisible.value = false
        loadData()
      } catch (err) {
        console.error(err)
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleStart = (row) => {
  ElMessageBox.confirm('确定要开始该盘点吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await startInventory(row.id)
      ElMessage.success('盘点已开始')
      loadData()
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

const handleScan = (row) => {
  currentPlanId.value = row.id
  scannedList.value = []
  scanForm.collection_no = ''
  scanForm.actual_location = ''
  scanDialogVisible.value = true
  nextTick(() => {
    scanInput.value?.focus()
  })
}

const handleScanSubmit = async () => {
  if (!scanForm.collection_no) {
    ElMessage.warning('请输入藏品编号')
    return
  }
  
  if (scannedList.value.includes(scanForm.collection_no)) {
    ElMessage.warning('该藏品已扫描')
    scanForm.collection_no = ''
    return
  }
  
  scanSubmitting.value = true
  try {
    await checkInventoryItem({
      plan_id: currentPlanId.value,
      collection_no: scanForm.collection_no,
      actual_location: scanForm.actual_location,
      is_offline: 0
    })
    scannedList.value.unshift(scanForm.collection_no)
    ElMessage.success('扫码成功')
    scanForm.collection_no = ''
    nextTick(() => {
      scanInput.value?.focus()
    })
  } catch (err) {
    console.error(err)
  } finally {
    scanSubmitting.value = false
  }
}

const handleBatchUpload = async () => {
  if (scannedList.value.length === 0) {
    ElMessage.warning('暂无扫描数据')
    return
  }
  
  try {
    await batchCheckInventory({
      plan_id: currentPlanId.value,
      items: scannedList.value,
      is_offline: 1
    })
    ElMessage.success('批量上传成功')
    scannedList.value = []
  } catch (err) {
    console.error(err)
  }
}

const handleComplete = (row) => {
  ElMessageBox.confirm('确定要完成该盘点吗？未扫描的藏品将标记为"待查"', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await completeInventory(row.id)
      ElMessage.success('盘点已完成')
      loadData()
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
  loadLocations()
})
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.scan-history {
  max-height: 300px;
  overflow-y: auto;
}

.scan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 600;
}

.scan-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 4px;
  margin-bottom: 8px;
}

.scan-item .el-icon {
  color: #67c23a;
  margin-right: 8px;
}
</style>
