<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>入库管理</span>
          <el-button type="primary" @click="handleAdd">新增入库单</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待入库" :value="0" />
            <el-option label="部分入库" :value="1" />
            <el-option label="已完成" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="order_no" label="入库单号" width="150" />
        <el-table-column prop="supplier" label="供应商" />
        <el-table-column prop="total_qty" label="总数量" width="100" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" v-if="row.status < 2" @click="handleReceive(row)">
              入库
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-form v-if="isAdd" :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="入库单号" prop="order_no">
          <el-input v-model="form.order_no" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="form.supplier" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
        <el-form-item label="商品明细">
          <el-table :data="form.items" border size="small" style="width: 100%">
            <el-table-column label="商品名称" min-width="200">
              <template #default="{ row, $index }">
                <el-select v-model="form.items[$index].product_id" style="width: 100%" size="small">
                  <el-option 
                    v-for="p in productList" 
                    :key="p.id" 
                    :label="`${p.name} (${p.sku})`" 
                    :value="p.id" 
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="计划数量" width="120">
              <template #default="{ row, $index }">
                <el-input-number v-model="form.items[$index].plan_qty" :min="1" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ $index }">
                <el-button size="small" type="danger" @click="form.items.splice($index, 1)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button size="small" style="margin-top: 10px" @click="addItem">添加商品</el-button>
        </el-form-item>
      </el-form>
      
      <div v-else-if="isView || isReceive">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="入库单号">{{ detail.order_no }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ detail.supplier }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(detail.status)">{{ getStatusText(detail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总数量">{{ detail.total_qty }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detail.remark }}</el-descriptions-item>
        </el-descriptions>
        
        <h4 style="margin: 20px 0 10px">商品明细</h4>
        <el-table :data="detail.items" border size="small">
          <el-table-column prop="sku" label="SKU" width="120" />
          <el-table-column prop="name" label="商品名称" />
          <el-table-column prop="plan_qty" label="计划数量" width="100" />
          <el-table-column prop="actual_qty" label="实际数量" width="100" />
          <el-table-column prop="location_code" label="入库库位" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'warning'">
                {{ row.status === 1 ? '已入库' : '待入库' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="isReceive" label="操作" width="200">
            <template #default="{ row }">
              <el-button v-if="row.status === 0" size="small" type="primary" @click="openReceiveDialog(row)">
                确认入库
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button v-if="isAdd" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="receiveDialogVisible" title="确认入库" width="500px">
      <el-form :model="receiveForm" label-width="100px">
        <el-form-item label="商品">
          <span>{{ currentReceiveItem?.name }}</span>
        </el-form-item>
        <el-form-item label="实际数量">
          <el-input-number v-model="receiveForm.actual_qty" :min="1" />
        </el-form-item>
        <el-form-item label="入库库位">
          <el-select v-model="receiveForm.location_id" style="width: 100%">
            <el-option 
              v-for="loc in locations" 
              :key="loc.id" 
              :label="loc.code" 
              :value="loc.id" 
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="receiveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReceive">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { inbound, locations as locationApi, products as productApi } from '../api'

const tableData = ref([])
const dialogVisible = ref(false)
const receiveDialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const isAdd = ref(false)
const isView = ref(false)
const isReceive = ref(false)

const searchForm = reactive({
  status: undefined
})

const form = reactive({
  order_no: '',
  supplier: '',
  remark: '',
  items: [{ product_id: '', plan_qty: 1 }]
})

const detail = ref({ items: [] })
const locations = ref([])
const productList = ref([])
const currentReceiveItem = ref(null)
const receiveForm = reactive({
  actual_qty: 1,
  location_id: null
})

const rules = {
  order_no: [{ required: true, message: '请输入入库单号', trigger: 'blur' }]
}

const getStatusType = (status) => {
  const types = ['warning', 'primary', 'success']
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = ['待入库', '部分入库', '已完成']
  return texts[status] || '未知'
}

const loadData = async () => {
  try {
    const params = {}
    if (searchForm.status !== undefined && searchForm.status !== '') {
      params.status = searchForm.status
    }
    const data = await inbound.list(params)
    tableData.value = data
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

const loadLocations = async () => {
  try {
    locations.value = await locationApi.list({ status: 1 })
  } catch (error) {
    console.error('加载库位失败')
  }
}

const loadProducts = async () => {
  try {
    productList.value = await productApi.list()
  } catch (error) {
    console.error('加载商品失败')
  }
}

const resetSearch = () => {
  searchForm.status = undefined
  loadData()
}

const addItem = () => {
  form.items.push({ product_id: productList.value[0]?.id || 1, plan_qty: 1 })
}

const handleAdd = async () => {
  await loadProducts()
  isAdd.value = true
  isView.value = false
  isReceive.value = false
  dialogTitle.value = '新增入库单'
  form.order_no = 'IN' + Date.now()
  form.supplier = ''
  form.remark = ''
  form.items = [{ product_id: productList.value[0]?.id || 1, plan_qty: 1 }]
  dialogVisible.value = true
}

const handleView = async (row) => {
  isAdd.value = false
  isView.value = true
  isReceive.value = false
  dialogTitle.value = '入库单详情'
  detail.value = await inbound.get(row.id)
  dialogVisible.value = true
}

const handleReceive = async (row) => {
  isAdd.value = false
  isView.value = false
  isReceive.value = true
  dialogTitle.value = '入库操作'
  await loadLocations()
  detail.value = await inbound.get(row.id)
  dialogVisible.value = true
}

const openReceiveDialog = (row) => {
  currentReceiveItem.value = row
  receiveForm.actual_qty = row.plan_qty
  receiveForm.location_id = null
  receiveDialogVisible.value = true
}

const confirmReceive = async () => {
  try {
    await inbound.receive(detail.value.id, {
      item_id: currentReceiveItem.value.id,
      actual_qty: receiveForm.actual_qty,
      location_id: receiveForm.location_id
    })
    ElMessage.success('入库成功')
    receiveDialogVisible.value = false
    detail.value = await inbound.get(detail.value.id)
    loadData()
  } catch (error) {
    ElMessage.error('入库失败')
  }
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    await inbound.create(form)
    ElMessage.success('创建成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-form {
  margin-bottom: 20px;
}
</style>
