<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReleasePlans, createReleasePlan, updateReleasePlan, deleteReleasePlan } from '@/api/release-plan'
import { getSeaAreas } from '@/api/sea-area'
import { listAllSpecies } from '@/api/species'

interface ReleasePlanForm {
  id?: number
  areaId: number | string
  speciesId: number | string
  planYear: string
  planSeason: string
  planQuantity: number | string
  status: string
  remarks: string
}

const defaultForm: ReleasePlanForm = {
  areaId: '',
  speciesId: '',
  planYear: '',
  planSeason: '',
  planQuantity: '',
  status: 'DRAFT',
  remarks: '',
}

const filterYear = ref('')
const filterAreaId = ref('')
const filterSpeciesId = ref('')
const filterStatus = ref('')

const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

const areaOptions = ref<any[]>([])
const speciesOptions = ref<any[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const form = reactive<ReleasePlanForm>({ ...defaultForm })

const seasonOptions = [
  { label: '春季', value: '春季' },
  { label: '夏季', value: '夏季' },
  { label: '秋季', value: '秋季' },
  { label: '冬季', value: '冬季' },
]

const statusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '进行中', value: 'ACTIVE' },
  { label: '已完成', value: 'COMPLETED' },
]

const statusTagType: Record<string, string> = {
  DRAFT: 'info',
  ACTIVE: 'warning',
  COMPLETED: 'success',
}

const statusLabel: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '进行中',
  COMPLETED: '已完成',
}

const formRules = reactive({
  areaId: [{ required: true, message: '请选择海域', trigger: 'change' }],
  speciesId: [{ required: true, message: '请选择物种', trigger: 'change' }],
  planYear: [{ required: true, message: '请选择年份', trigger: 'change' }],
  planSeason: [{ required: true, message: '请选择季节', trigger: 'change' }],
  planQuantity: [{ required: true, message: '请输入计划投放量', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
})

const fetchAreas = async () => {
  try {
    const res = await getSeaAreas({ page: 1, size: 1000 })
    if (res.data) areaOptions.value = res.data.records || []
  } catch {}
}

const fetchSpecies = async () => {
  try {
    const res = await listAllSpecies()
    if (res.data) speciesOptions.value = Array.isArray(res.data) ? res.data : res.data.records || []
  } catch {}
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: page.value, size: size.value }
    if (filterYear.value) params.planYear = filterYear.value
    if (filterAreaId.value) params.areaId = filterAreaId.value
    if (filterSpeciesId.value) params.speciesId = filterSpeciesId.value
    if (filterStatus.value) params.status = filterStatus.value
    const res = await getReleasePlans(params)
    if (res.data) {
      tableData.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch {
    ElMessage.error('获取投放计划数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchData()
}

const handleReset = () => {
  filterYear.value = ''
  filterAreaId.value = ''
  filterSpeciesId.value = ''
  filterStatus.value = ''
  page.value = 1
  fetchData()
}

const handleAdd = () => {
  dialogTitle.value = '新增投放计划'
  Object.assign(form, { ...defaultForm, id: undefined })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑投放计划'
  Object.assign(form, {
    id: row.id,
    areaId: row.areaId,
    speciesId: row.speciesId,
    planYear: String(row.planYear),
    planSeason: row.planSeason,
    planQuantity: row.planQuantity,
    status: row.status,
    remarks: row.remarks || '',
  })
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定删除该投放计划吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteReleasePlan(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    const payload = { ...form, planYear: Number(form.planYear) || form.planYear }
    if (form.id) {
      await updateReleasePlan(form.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createReleasePlan(payload)
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

const formatQuantity = (val: number) => {
  return val != null ? val.toLocaleString() : ''
}

onMounted(() => {
  fetchAreas()
  fetchSpecies()
  fetchData()
})
</script>

<template>
  <div class="release-plan-page">
    <div class="page-card">
      <div class="filter-bar">
        <el-date-picker
          v-model="filterYear"
          type="year"
          placeholder="选择年份"
          value-format="YYYY"
          style="width: 140px"
        />
        <el-select v-model="filterAreaId" placeholder="选择海域" clearable style="width: 160px">
          <el-option
            v-for="area in areaOptions"
            :key="area.id"
            :label="area.areaName"
            :value="area.id"
          />
        </el-select>
        <el-select v-model="filterSpeciesId" placeholder="选择物种" clearable style="width: 160px">
          <el-option
            v-for="sp in speciesOptions"
            :key="sp.id"
            :label="sp.speciesName"
            :value="sp.id"
          />
        </el-select>
        <el-select v-model="filterStatus" placeholder="选择状态" clearable style="width: 140px">
          <el-option
            v-for="s in statusOptions"
            :key="s.value"
            :label="s.label"
            :value="s.value"
          />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" style="margin-left: auto" @click="handleAdd">新增计划</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="planYear" label="年份" width="90" align="center" />
        <el-table-column prop="areaName" label="海域名称" min-width="120" />
        <el-table-column prop="speciesName" label="物种名称" min-width="120" />
        <el-table-column prop="planSeason" label="季节" width="90" align="center" />
        <el-table-column label="计划投放量(尾)" min-width="140" align="right">
          <template #default="{ row }">
            {{ formatQuantity(row.planQuantity) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status] as any" size="small">
              {{ statusLabel[row.status] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="160" show-overflow-tooltip />
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="110px">
        <el-form-item label="海域" prop="areaId">
          <el-select v-model="form.areaId" placeholder="请选择海域" style="width: 100%">
            <el-option
              v-for="area in areaOptions"
              :key="area.id"
              :label="area.areaName"
              :value="area.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物种" prop="speciesId">
          <el-select v-model="form.speciesId" placeholder="请选择物种" style="width: 100%">
            <el-option
              v-for="sp in speciesOptions"
              :key="sp.id"
              :label="sp.speciesName"
              :value="sp.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="年份" prop="planYear">
          <el-date-picker
            v-model="form.planYear"
            type="year"
            placeholder="请选择年份"
            value-format="YYYY"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="季节" prop="planSeason">
          <el-select v-model="form.planSeason" placeholder="请选择季节" style="width: 100%">
            <el-option
              v-for="s in seasonOptions"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="计划投放量" prop="planQuantity">
          <el-input-number
            v-model="form.planQuantity"
            :min="1"
            :step="1000"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option
              v-for="s in statusOptions"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="form.remarks" type="textarea" :rows="3" />
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
.release-plan-page {
  padding: 4px;
}

.page-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
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

:deep(.el-tag--info) {
  --el-tag-bg-color: #F0F4F8;
  --el-tag-border-color: #E2E8F0;
  --el-tag-text-color: #64748B;
}

:deep(.el-tag--warning) {
  --el-tag-bg-color: #FFF7ED;
  --el-tag-border-color: #FED7AA;
  --el-tag-text-color: #E76F51;
}

:deep(.el-tag--success) {
  --el-tag-bg-color: #F0FFF4;
  --el-tag-border-color: #C6F6D5;
  --el-tag-text-color: #2C7865;
}
</style>
