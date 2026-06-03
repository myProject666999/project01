<template>
  <div class="page-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">排放点管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增排放点
          </el-button>
        </div>
      </template>
      <el-table :data="tableData" stripe border style="width: 100%">
        <el-table-column prop="pointCode" label="排放点编号" width="120" />
        <el-table-column prop="pointName" label="排放点名称" width="180" />
        <el-table-column prop="location" label="位置" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column label="阈值设置">
          <template #default="{ row }">
            <div class="threshold-info">
              <span>COD: ≤{{ row.codThreshold }}</span>
              <span>pH: {{ row.phMinThreshold }}-{{ row.phMaxThreshold }}</span>
              <span>色度: ≤{{ row.colorThreshold }}</span>
              <span>氨氮: ≤{{ row.ammoniaThreshold }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '运行中' : '已停机' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排放点编号" prop="pointCode">
              <el-input v-model="form.pointCode" placeholder="请输入排放点编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排放点名称" prop="pointName">
              <el-input v-model="form.pointName" placeholder="请输入排放点名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="位置" prop="location">
          <el-input v-model="form.location" placeholder="请输入位置" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
        <el-divider content-position="left">阈值设置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="COD阈值">
              <el-input-number v-model="form.codThreshold" :min="0" :precision="2" style="width: 100%" />
              <span class="unit">mg/L</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="pH范围">
              <el-input-number v-model="form.phMinThreshold" :min="0" :max="14" :precision="2" :step="0.1" />
              <span class="range-sep"> - </span>
              <el-input-number v-model="form.phMaxThreshold" :min="0" :max="14" :precision="2" :step="0.1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="色度阈值">
              <el-input-number v-model="form.colorThreshold" :min="0" :precision="2" style="width: 100%" />
              <span class="unit">倍</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="氨氮阈值">
              <el-input-number v-model="form.ammoniaThreshold" :min="0" :precision="2" style="width: 100%" />
              <span class="unit">mg/L</span>
            </el-form-item>
          </el-col>
        </el-row>
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
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const isEdit = ref(false)

const form = reactive({
  id: null,
  pointCode: '',
  pointName: '',
  location: '',
  description: '',
  codThreshold: 500,
  phMinThreshold: 6,
  phMaxThreshold: 9,
  colorThreshold: 80,
  ammoniaThreshold: 45
})

const rules = {
  pointCode: [{ required: true, message: '请输入排放点编号', trigger: 'blur' }],
  pointName: [{ required: true, message: '请输入排放点名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }]
}

const fetchData = async () => {
  try {
    const res = await request.get('/discharge-point/list')
    tableData.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增排放点'
  Object.assign(form, {
    id: null,
    pointCode: '',
    pointName: '',
    location: '',
    description: '',
    codThreshold: 500,
    phMinThreshold: 6,
    phMaxThreshold: 9,
    colorThreshold: 80,
    ammoniaThreshold: 45
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑排放点'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除排放点【${row.pointName}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete(`/discharge-point/${row.id}`)
      ElMessage.success('删除成功')
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await request.put('/discharge-point', form)
          ElMessage.success('修改成功')
        } else {
          await request.post('/discharge-point', form)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (e) {
        console.error(e)
      }
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.threshold-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #606266;
}
.unit {
  margin-left: 8px;
  color: #909399;
  font-size: 13px;
}
.range-sep {
  margin: 0 8px;
  color: #909399;
}
</style>
