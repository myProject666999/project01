<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRecaptureRecords, createRecaptureRecord, updateRecaptureRecord, deleteRecaptureRecord } from '@/api/recapture'
import { getSeaAreas } from '@/api/sea-area'
import { listAllSpecies } from '@/api/species'

interface RecaptureForm {
  id?: number
  areaId: number | string
  speciesId: number | string
  vesselName: string
  sizeGrade: string
  catchWeight: number | string
  catchCount: number | string
  catchDate: string
  remarks: string
}

const defaultForm: RecaptureForm = {
  areaId: '',
  speciesId: '',
  vesselName: '',
  sizeGrade: '',
  catchWeight: '',
  catchCount: '',
  catchDate: '',
  remarks: '',
}

const filterAreaId = ref('')
const filterSpeciesId = ref('')
const filterDateRange = ref<[string, string] | null>(null)

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
const form = reactive<RecaptureForm>({ ...defaultForm })

const formRules = reactive({
  areaId: [{ required: true, message: '请选择海域', trigger: 'change' }],
  speciesId: [{ required: true, message: '请选择物种', trigger: 'change' }],
  vesselName: [{ required: true, message: '请输入船只名称', trigger: 'blur' }],
  sizeGrade: [{ required: true, message: '请选择规格等级', trigger: 'change' }],
  catchWeight: [{ required: true, message: '请输入回捕重量', trigger: 'blur' }],
  catchCount: [{ required: true, message: '请输入回捕数量', trigger: 'blur' }],
  catchDate: [{ required: true, message: '请选择回捕日期', trigger: 'change' }],
})

const sizeGradeTagType: Record<string, string> = {
  '大': 'danger',
  '中': 'warning',
  '小': 'info',
}

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
    if (filterAreaId.value) params.areaId = filterAreaId.value
    if (filterSpeciesId.value) params.speciesId = filterSpeciesId.value
    if (filterDateRange.value && filterDateRange.value.length === 2) {
      params.startDate = filterDateRange.value[0]
      params.endDate = filterDateRange.value[1]
    }
    const res = await getRecaptureRecords(params)
    if (res.data) {
      tableData.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch {
    ElMessage.error('获取回捕记录数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchData()
}

const handleReset = () => {
  filterAreaId.value = ''
  filterSpeciesId.value = ''
  filterDateRange.value = null
  page.value = 1
  fetchData()
}

const handleAdd = () => {
  dialogTitle.value = '新增回捕记录'
  Object.assign(form, { ...defaultForm, id: undefined })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑回捕记录'
  Object.assign(form, {
    id: row.id,
    areaId: row.areaId,
    speciesId: row.speciesId,
    vesselName: row.vesselName,
    sizeGrade: row.sizeGrade,
    catchWeight: row.catchWeight,
    catchCount: row.catchCount,
    catchDate: row.catchDate,
    remarks: row.remarks || '',
  })
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定删除该回捕记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteRecaptureRecord(row.id)
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
    const payload = { ...form }
    if (form.id) {
      await updateRecaptureRecord(form.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createRecaptureRecord(payload)
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

const formatDate = (val: string) => {
  if (!val) return ''
  const d = new Date(val)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

onMounted(() => {
  fetchAreas()
  fetchSpecies()
  fetchData()
})
</script>

<template>
  <div class="recapture-page">
    <div class="page-card">
      <div class="filter-bar">
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
        <el-date-picker
          v-model="filterDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 280px"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" style="margin-left: auto" @click="handleAdd">新增记录</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="vesselName" label="船只名称" min-width="120" />
        <el-table-column prop="areaName" label="海域名称" min-width="120" />
        <el-table-column prop="speciesName" label="物种名称" min-width="120" />
        <el-table-column label="规格等级" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="sizeGradeTagType[row.sizeGrade] || 'info'" size="small">
              {{ row.sizeGrade }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="回捕重量(kg)" min-width="120" align="right">
          <template #default="{ row }">
            {{ row.catchWeight != null ? row.catchWeight.toFixed(2) : '' }}
          </template>
        </el-table-column>
        <el-table-column label="回捕数量(尾)" min-width="120" align="right">
          <template #default="{ row }">
            {{ row.catchCount != null ? row.catchCount.toLocaleString() : '' }}
          </template>
        </el-table-column>
        <el-table-column label="回捕日期" min-width="120">
          <template #default="{ row }">
            {{ formatDate(row.catchDate) }}
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px" destroy-on-close>
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
        <el-form-item label="船只名称" prop="vesselName">
          <el-input v-model="form.vesselName" />
        </el-form-item>
        <el-form-item label="规格等级" prop="sizeGrade">
          <el-select v-model="form.sizeGrade" placeholder="请选择规格等级" style="width: 100%">
            <el-option label="大" value="大" />
            <el-option label="中" value="中" />
            <el-option label="小" value="小" />
          </el-select>
        </el-form-item>
        <el-form-item label="回捕重量(kg)" prop="catchWeight">
          <el-input-number
            v-model="form.catchWeight"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="回捕数量(尾)" prop="catchCount">
          <el-input-number
            v-model="form.catchCount"
            :min="0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="回捕日期" prop="catchDate">
          <el-date-picker
            v-model="form.catchDate"
            type="date"
            placeholder="请选择回捕日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
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
.recapture-page {
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

:deep(.el-tag--danger) {
  --el-tag-bg-color: #FFF5F5;
  --el-tag-border-color: #FED7D7;
  --el-tag-text-color: #E76F51;
}

:deep(.el-tag--warning) {
  --el-tag-bg-color: #FFF7ED;
  --el-tag-border-color: #FED7AA;
  --el-tag-text-color: #E76F51;
}

:deep(.el-tag--info) {
  --el-tag-bg-color: #F0F4F8;
  --el-tag-border-color: #E2E8F0;
  --el-tag-text-color: #64748B;
}
</style>
