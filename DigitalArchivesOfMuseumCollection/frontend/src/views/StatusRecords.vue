<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">状态记录</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增记录
      </el-button>
    </div>

    <el-card>
      <div class="search-bar">
        <el-select v-model="searchForm.record_type" placeholder="记录类型" clearable style="width: 140px">
          <el-option label="状态变更" value="状态变更" />
          <el-option label="损坏记录" value="损坏记录" />
          <el-option label="修复记录" value="修复记录" />
          <el-option label="保养记录" value="保养记录" />
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
        <el-table-column prop="collection_no" label="藏品编号" width="140" />
        <el-table-column prop="collection_name" label="藏品名称" min-width="150" />
        <el-table-column prop="record_type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.record_type)" size="small">{{ row.record_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="old_status" label="原状态" width="100" />
        <el-table-column prop="new_status" label="新状态" width="100" />
        <el-table-column prop="change_reason" label="原因/描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="created_at" label="记录时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">详情</el-button>
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
      title="新增状态记录"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="藏品" prop="collection_id">
          <el-select v-model="form.collection_id" filterable style="width: 100%" placeholder="请选择藏品">
            <el-option v-for="col in collections" :key="col.id" :label="`${col.collection_no} - ${col.name}`" :value="col.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录类型" prop="record_type">
          <el-select v-model="form.record_type" style="width: 100%">
            <el-option label="状态变更" value="状态变更" />
            <el-option label="损坏记录" value="损坏记录" />
            <el-option label="修复记录" value="修复记录" />
            <el-option label="保养记录" value="保养记录" />
          </el-select>
        </el-form-item>
        <el-form-item label="新状态" prop="new_status">
          <el-select v-model="form.new_status" style="width: 100%">
            <el-option label="在库" value="在库" />
            <el-option label="展出" value="展出" />
            <el-option label="外借" value="外借" />
            <el-option label="修复中" value="修复中" />
            <el-option label="待查" value="待查" />
          </el-select>
        </el-form-item>
        <el-form-item label="变化原因" prop="change_reason">
          <el-input v-model="form.change_reason" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item v-if="form.record_type === '损坏记录'" label="损坏描述" prop="damage_description">
          <el-input v-model="form.damage_description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item v-if="form.record_type === '修复记录'" label="修复方案" prop="repair_plan">
          <el-input v-model="form.repair_plan" type="textarea" :rows="2" />
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
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import {
  getStatusRecords,
  createStatusRecord,
  getCollections
} from '@/api'

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const collections = ref([])

const searchForm = reactive({
  record_type: ''
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const tableData = ref([])

const form = reactive({
  collection_id: null,
  record_type: '',
  new_status: '',
  change_reason: '',
  damage_description: '',
  repair_plan: ''
})

const formRules = {
  collection_id: [{ required: true, message: '请选择藏品', trigger: 'change' }],
  record_type: [{ required: true, message: '请选择记录类型', trigger: 'change' }],
  new_status: [{ required: true, message: '请选择新状态', trigger: 'change' }]
}

const getTypeTagType = (type) => {
  const types = {
    '状态变更': 'primary',
    '损坏记录': 'danger',
    '修复记录': 'warning',
    '保养记录': 'success'
  }
  return types[type] || 'info'
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getStatusRecords({
      page: pagination.page,
      page_size: pagination.page_size,
      record_type: searchForm.record_type
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
  searchForm.record_type = ''
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

const handleAdd = () => {
  Object.assign(form, {
    collection_id: null,
    record_type: '',
    new_status: '',
    change_reason: '',
    damage_description: '',
    repair_plan: ''
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  console.log('View record:', row)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await createStatusRecord(form)
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

onMounted(() => {
  loadData()
  loadCollections()
})
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
