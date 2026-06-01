<template>
  <div class="waste">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>报废记录</span>
          <el-button type="primary" @click="openDialog">
            <el-icon><Plus /></el-icon>
            新增报废
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-form :inline="true">
          <el-form-item label="记录日期">
            <el-date-picker v-model="filterDate" type="date" placeholder="选择日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-table :data="records" style="width: 100%">
        <el-table-column prop="record_date" label="记录日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.record_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="product.name" label="菜品名称" />
        <el-table-column prop="quantity" label="数量" width="100">
          <template #default="{ row }">
            {{ row.quantity }} kg
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="报废原因" />
        <el-table-column prop="handler" label="处理人" width="100" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增报废记录" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="菜品" prop="product_id">
          <el-select v-model="form.product_id" placeholder="请选择菜品" style="width: 100%">
            <el-option v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="form.quantity" :min="0" :step="0.5" style="width: 100%" />
          <span style="margin-left: 10px">kg</span>
        </el-form-item>
        <el-form-item label="报废原因" prop="reason">
          <el-select v-model="form.reason" placeholder="请选择报废原因" style="width: 100%">
            <el-option label="原材料不合格" value="原材料不合格" />
            <el-option label="加工过程损坏" value="加工过程损坏" />
            <el-option label="过期" value="过期" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理人" prop="handler">
          <el-input v-model="form.handler" placeholder="请输入处理人" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
import { ElMessage } from 'element-plus'
import { getWasteRecords, createWasteRecord, getProducts } from '@/api'

const records = ref([])
const products = ref([])
const filterDate = ref('')
const dialogVisible = ref(false)
const formRef = ref(null)

const form = reactive({
  product_id: null,
  quantity: 0,
  reason: '',
  handler: '',
  remark: ''
})

const rules = {
  product_id: [{ required: true, message: '请选择菜品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  reason: [{ required: true, message: '请选择报废原因', trigger: 'change' }]
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

const loadData = async () => {
  const params = {}
  if (filterDate.value) params.date = filterDate.value
  
  getWasteRecords(params).then(res => {
    records.value = res.data || []
  }).catch(err => {
      console.error('加载报废记录失败', err)
    })
}

const resetFilter = () => {
  filterDate.value = ''
  loadData()
}

const openDialog = () => {
  form.product_id = null
  form.quantity = 0
  form.reason = ''
  form.handler = ''
  form.remark = ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  
  try {
    await createWasteRecord(form)
    ElMessage.success('报废记录创建成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('创建报废记录失败', error)
  }
}

onMounted(async () => {
  loadData()
  const res = await getProducts()
  products.value = res.data || []
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
