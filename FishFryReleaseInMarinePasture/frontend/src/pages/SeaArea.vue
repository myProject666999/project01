<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSeaAreas, createSeaArea, updateSeaArea, deleteSeaArea } from '@/api/sea-area'

interface SeaAreaForm {
  id?: number
  areaCode: string
  areaName: string
  areaSize: number | string
  longitude: number | string
  latitude: number | string
  description: string
  status: number
}

const defaultForm: SeaAreaForm = {
  areaCode: '',
  areaName: '',
  areaSize: '',
  longitude: '',
  latitude: '',
  description: '',
  status: 1,
}

const keyword = ref('')
const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const form = reactive<SeaAreaForm>({ ...defaultForm })

const formRules = reactive({
  areaCode: [{ required: true, message: '请输入海域编号', trigger: 'blur' }],
  areaName: [{ required: true, message: '请输入海域名称', trigger: 'blur' }],
  areaSize: [{ required: true, message: '请输入海域面积', trigger: 'blur' }],
  longitude: [{ required: true, message: '请输入经度', trigger: 'blur' }],
  latitude: [{ required: true, message: '请输入纬度', trigger: 'blur' }],
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSeaAreas({ page: page.value, size: size.value, keyword: keyword.value })
    if (res.data) {
      tableData.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch {
    ElMessage.error('获取海域数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchData()
}

const handleReset = () => {
  keyword.value = ''
  page.value = 1
  fetchData()
}

const handleAdd = () => {
  dialogTitle.value = '新增海域'
  Object.assign(form, { ...defaultForm, id: undefined })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑海域'
  Object.assign(form, {
    id: row.id,
    areaCode: row.areaCode,
    areaName: row.areaName,
    areaSize: row.areaSize,
    longitude: row.longitude,
    latitude: row.latitude,
    description: row.description || '',
    status: row.status,
  })
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除海域「${row.areaName}」吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteSeaArea(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleStatusChange = async (row: any) => {
  try {
    await updateSeaArea(row.id, { ...row })
    ElMessage.success('状态更新成功')
  } catch {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    if (form.id) {
      await updateSeaArea(form.id, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createSeaArea({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error(form.id ? '更新失败' : '新增失败')
  }
}

const handlePageChange = (val: number) => {
  page.value = val
  fetchData()
}

const handleSizeChange = (val: number) => {
  size.value = val
  page.value = 1
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="sea-area-page">
    <div class="page-card">
      <div class="search-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索海域编号/名称"
          clearable
          style="width: 260px"
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" style="margin-left: auto" @click="handleAdd">新增海域</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="areaCode" label="海域编号" min-width="120" />
        <el-table-column prop="areaName" label="海域名称" min-width="120" />
        <el-table-column prop="areaSize" label="面积(亩)" min-width="100" />
        <el-table-column prop="longitude" label="经度" min-width="120" />
        <el-table-column prop="latitude" label="纬度" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="160" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              active-color="#2C7865"
              inactive-color="#C0C4CC"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="580px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="海域编号" prop="areaCode">
          <el-input v-model="form.areaCode" />
        </el-form-item>
        <el-form-item label="海域名称" prop="areaName">
          <el-input v-model="form.areaName" />
        </el-form-item>
        <el-form-item label="面积(亩)" prop="areaSize">
          <el-input-number v-model="form.areaSize" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input-number v-model="form.longitude" :precision="6" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input-number v-model="form.latitude" :precision="6" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.sea-area-page {
  padding: 4px;
}

.page-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

:deep(.el-button--primary) {
  --el-button-bg-color: #0A2647;
  --el-button-border-color: #0A2647;
  --el-button-hover-bg-color: #144272;
  --el-button-hover-border-color: #144272;
}

:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #2C7865;
  border-color: #2C7865;
}
</style>
