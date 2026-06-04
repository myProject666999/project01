<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">移动管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增移动
      </el-button>
    </div>

    <el-card>
      <div class="search-bar">
        <el-select v-model="searchForm.type" placeholder="移动类型" clearable style="width: 140px">
          <el-option label="调库" value="调库" />
          <el-option label="展出" value="展出" />
          <el-option label="外借" value="外借" />
          <el-option label="归还" value="归还" />
          <el-option label="修复" value="修复" />
        </el-select>
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 140px">
          <el-option label="待审批" value="待审批" />
          <el-option label="已批准" value="已批准" />
          <el-option label="出库中" value="出库中" />
          <el-option label="已完成" value="已完成" />
          <el-option label="已拒绝" value="已拒绝" />
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
        <el-table-column prop="movement_no" label="移动单号" width="160" />
        <el-table-column prop="collection.name" label="藏品名称" min-width="150" />
        <el-table-column prop="movement_type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.movement_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="from_location" label="原位置" min-width="150" />
        <el-table-column prop="to_location" label="目标位置" min-width="150" />
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
            <el-button v-if="row.status === '待审批'" type="success" link size="small" @click="handleApprove(row)">审批</el-button>
            <el-button v-if="row.status === '已批准'" type="warning" link size="small" @click="handleOutHandover(row)">出库交接</el-button>
            <el-button v-if="row.status === '出库中'" type="success" link size="small" @click="handleInHandover(row)">入库交接</el-button>
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
      title="新增移动"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-form-item label="藏品" prop="collection_id">
          <el-select v-model="form.collection_id" filterable style="width: 100%" placeholder="请选择藏品">
            <el-option v-for="col in collections" :key="col.id" :label="`${col.collection_no} - ${col.name}`" :value="col.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="移动类型" prop="movement_type">
          <el-select v-model="form.movement_type" style="width: 100%">
            <el-option label="调库" value="调库" />
            <el-option label="展出" value="展出" />
            <el-option label="外借" value="外借" />
            <el-option label="归还" value="归还" />
            <el-option label="修复" value="修复" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标位置" prop="to_location">
          <el-select v-model="form.to_location" filterable style="width: 100%">
            <el-option v-for="loc in locations" :key="loc.id" :label="loc.name" :value="loc.name" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.movement_type === '展出' || form.movement_type === '外借'" label="展览名称" prop="exhibition_name">
          <el-input v-model="form.exhibition_name" />
        </el-form-item>
        <el-form-item v-if="form.movement_type === '外借'" label="借展单位" prop="borrower">
          <el-input v-model="form.borrower" />
        </el-form-item>
        <el-form-item v-if="form.movement_type === '外借'" label="预计归还日期" prop="expected_return_date">
          <el-date-picker v-model="form.expected_return_date" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="移动原因" prop="reason">
          <el-input v-model="form.reason" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {
  getMovements,
  createMovement,
  approveMovement,
  outHandover,
  inHandover,
  getCollections,
  getLocations
} from '@/api'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const collections = ref([])
const locations = ref([])

const searchForm = reactive({
  type: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const tableData = ref([])

const form = reactive({
  collection_id: null,
  movement_type: '',
  to_location: '',
  exhibition_name: '',
  borrower: '',
  expected_return_date: null,
  reason: ''
})

const formRules = {
  collection_id: [{ required: true, message: '请选择藏品', trigger: 'change' }],
  movement_type: [{ required: true, message: '请选择移动类型', trigger: 'change' }],
  to_location: [{ required: true, message: '请选择目标位置', trigger: 'change' }]
}

const getStatusTagType = (status) => {
  const types = {
    '待审批': 'warning',
    '已批准': 'primary',
    '出库中': 'info',
    '已完成': 'success',
    '已拒绝': 'danger',
    '已取消': 'info'
  }
  return types[status] || 'info'
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMovements({
      page: pagination.page,
      page_size: pagination.page_size,
      type: searchForm.type,
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
  searchForm.type = ''
  searchForm.status = ''
  pagination.page = 1
  loadData()
}

const loadCollections = async () => {
  try {
    const res = await getCollections({ page: 1, page_size: 1000 })
    collections.value = res.list
  } catch (err) {
    console.error(err)
  }
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
    collection_id: null,
    movement_type: '',
    to_location: '',
    exhibition_name: '',
    borrower: '',
    expected_return_date: null,
    reason: ''
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/movements/${row.id}`)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await createMovement(form)
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

const handleApprove = (row) => {
  ElMessageBox.confirm('确定要批准该移动申请吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await approveMovement(row.id)
      ElMessage.success('审批成功')
      loadData()
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

const handleOutHandover = (row) => {
  ElMessageBox.confirm('确定要进行出库交接吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await outHandover(row.id)
      ElMessage.success('出库交接完成')
      loadData()
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

const handleInHandover = (row) => {
  ElMessageBox.confirm('确定要进行入库交接吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await inHandover(row.id)
      ElMessage.success('入库交接完成')
      loadData()
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
  loadCollections()
  loadLocations()
})
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
