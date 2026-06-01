<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">仓位管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增仓位</el-button>
    </div>

    <div class="filter-bar">
      <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px;">
        <el-option label="启用" value="active" />
        <el-option label="维护中" value="maintenance" />
        <el-option label="停用" value="disabled" />
      </el-select>
      <el-input v-model="filters.mountain" placeholder="适用山头" clearable style="width: 150px;" />
      <el-input v-model="filters.fragrance_type" placeholder="适用香型" clearable style="width: 150px;" />
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="location_code" label="仓位坐标" width="120">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.location_code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="warehouse_no" label="仓号" width="80" />
        <el-table-column prop="cabinet_no" label="柜号" width="80" />
        <el-table-column prop="shelf_no" label="层号" width="80" />
        <el-table-column prop="mountain" label="适用山头" width="120" />
        <el-table-column prop="fragrance_type" label="适用香型" width="120" />
        <el-table-column label="容量" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="Math.round(row.current_quantity / row.max_capacity * 100)"
              :status="row.current_quantity / row.max_capacity > 0.9 ? 'warning' : ''"
            />
            <span style="font-size: 12px; color: #909399;">{{ row.current_quantity }}/{{ row.max_capacity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status].type" size="small">
              {{ statusMap[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑仓位' : '新增仓位'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="仓号" prop="warehouse_no">
              <el-input v-model="form.warehouse_no" placeholder="如：A" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="柜号" prop="cabinet_no">
              <el-input v-model="form.cabinet_no" placeholder="如：01" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="层号" prop="shelf_no">
              <el-input v-model="form.shelf_no" placeholder="如：01" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="适用山头" prop="mountain">
          <el-input v-model="form.mountain" placeholder="留空表示不限" />
        </el-form-item>
        <el-form-item label="适用香型" prop="fragrance_type">
          <el-input v-model="form.fragrance_type" placeholder="留空表示不限" />
        </el-form-item>
        <el-form-item label="最大容量" prop="max_capacity">
          <el-input v-model.number="form.max_capacity" placeholder="默认100" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%;">
            <el-option label="启用" value="active" />
            <el-option label="维护中" value="maintenance" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getStorageLocations, createStorageLocation, updateStorageLocation, deleteStorageLocation } from '../api/storageLocations'

const formRef = ref(null)
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)

const statusMap = {
  active: { label: '启用', type: 'success' },
  maintenance: { label: '维护中', type: 'warning' },
  disabled: { label: '停用', type: 'danger' }
}

const filters = reactive({
  status: '',
  mountain: '',
  fragrance_type: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const form = reactive({
  id: null,
  warehouse_no: '',
  cabinet_no: '',
  shelf_no: '',
  mountain: '',
  fragrance_type: '',
  max_capacity: 100,
  status: 'active'
})

const rules = {
  warehouse_no: [{ required: true, message: '请输入仓号', trigger: 'blur' }],
  cabinet_no: [{ required: true, message: '请输入柜号', trigger: 'blur' }],
  shelf_no: [{ required: true, message: '请输入层号', trigger: 'blur' }],
  max_capacity: [{ required: true, message: '请输入最大容量', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    }
    const res = await getStorageLocations(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.status = ''
  filters.mountain = ''
  filters.fragrance_type = ''
  pagination.page = 1
  loadData()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    warehouse_no: '',
    cabinet_no: '',
    shelf_no: '',
    mountain: '',
    fragrance_type: '',
    max_capacity: 100,
    status: 'active'
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateStorageLocation(form.id, form)
          ElMessage.success('更新成功')
        } else {
          await createStorageLocation(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('提交失败:', error)
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除仓位"${row.location_code}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteStorageLocation(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>
