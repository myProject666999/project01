<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <el-button type="primary" @click="handleAdd">新增订单</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待处理" :value="0" />
            <el-option label="已生成波次" :value="1" />
            <el-option label="拣货中" :value="2" />
            <el-option label="待复核" :value="3" />
            <el-option label="已完成" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台">
          <el-select v-model="searchForm.platform" placeholder="请选择" clearable style="width: 150px">
            <el-option label="天猫国际" value="天猫国际" />
            <el-option label="京东国际" value="京东国际" />
            <el-option label="考拉海购" value="考拉海购" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="order_no" label="订单号" width="150" />
        <el-table-column prop="platform" label="平台" width="120" />
        <el-table-column prop="customer_name" label="客户姓名" width="100" />
        <el-table-column prop="customer_phone" label="电话" width="120" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="total_qty" label="数量" width="80" />
        <el-table-column prop="total_amount" label="金额" width="100">
          <template #default="{ row }">¥{{ row.total_amount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div style="margin-top: 20px">
        <el-button type="success" :disabled="selectedOrders.length === 0" @click="generateWave">
          生成波次拣货
        </el-button>
        <span style="margin-left: 10px">已选择 {{ selectedOrders.length }} 个订单</span>
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px">
      <el-form v-if="isAdd" :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单号" prop="order_no">
              <el-input v-model="form.order_no" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台" prop="platform">
              <el-select v-model="form.platform" style="width: 100%">
                <el-option label="天猫国际" value="天猫国际" />
                <el-option label="京东国际" value="京东国际" />
                <el-option label="考拉海购" value="考拉海购" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="customer_name">
              <el-input v-model="form.customer_name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="customer_phone">
              <el-input v-model="form.customer_phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" type="textarea" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="form.id_card" />
        </el-form-item>
        <el-form-item label="商品明细">
          <el-table :data="form.items" border size="small" style="width: 100%">
            <el-table-column prop="product_id" label="商品ID" width="100" />
            <el-table-column prop="quantity" label="数量" width="100">
              <template #default="{ row, $index }">
                <el-input-number v-model="form.items[$index].quantity" :min="1" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价" width="120">
              <template #default="{ row, $index }">
                <el-input-number v-model="form.items[$index].price" :min="0" :precision="2" size="small" />
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
      
      <div v-else>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ detail.order_no }}</el-descriptions-item>
          <el-descriptions-item label="平台">{{ detail.platform }}</el-descriptions-item>
          <el-descriptions-item label="客户姓名">{{ detail.customer_name }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ detail.customer_phone }}</el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{ detail.address }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ detail.id_card }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(detail.status)">{{ getStatusText(detail.status) }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <h4 style="margin: 20px 0 10px">商品明细</h4>
        <el-table :data="detail.items" border size="small">
          <el-table-column prop="sku" label="SKU" width="120" />
          <el-table-column prop="name" label="商品名称" />
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column prop="picked_qty" label="已拣数量" width="100" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
        </el-table>
      </div>
      
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button v-if="isAdd" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { orders, waves } from '../api'

const router = useRouter()
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const isAdd = ref(false)
const selectedOrders = ref([])

const searchForm = reactive({
  status: undefined,
  platform: ''
})

const form = reactive({
  order_no: '',
  platform: '',
  customer_name: '',
  customer_phone: '',
  address: '',
  id_card: '',
  items: [{ product_id: 1, quantity: 1, price: 0 }]
})

const detail = ref({ items: [] })

const rules = {
  order_no: [{ required: true, message: '请输入订单号', trigger: 'blur' }],
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  customer_name: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  customer_phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }]
}

const getStatusType = (status) => {
  const types = ['info', 'warning', 'primary', 'success', '']
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = ['待处理', '已生成波次', '拣货中', '待复核', '已完成']
  return texts[status] || '未知'
}

const handleSelectionChange = (selection) => {
  selectedOrders.value = selection.filter(item => item.status === 0)
}

const generateWave = async () => {
  try {
    const result = await waves.generate({
      order_ids: selectedOrders.value.map(item => item.id)
    })
    ElMessage.success('波次生成成功')
    router.push('/waves')
  } catch (error) {
    ElMessage.error('波次生成失败')
  }
}

const loadData = async () => {
  try {
    const params = {}
    if (searchForm.status !== undefined && searchForm.status !== '') {
      params.status = searchForm.status
    }
    if (searchForm.platform) {
      params.platform = searchForm.platform
    }
    const data = await orders.list(params)
    tableData.value = data
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

const resetSearch = () => {
  searchForm.status = undefined
  searchForm.platform = ''
  loadData()
}

const addItem = () => {
  form.items.push({ product_id: 1, quantity: 1, price: 0 })
}

const handleAdd = () => {
  isAdd.value = true
  dialogTitle.value = '新增订单'
  form.order_no = 'SO' + Date.now()
  form.platform = ''
  form.customer_name = ''
  form.customer_phone = ''
  form.address = ''
  form.id_card = ''
  form.items = [{ product_id: 1, quantity: 1, price: 0 }]
  dialogVisible.value = true
}

const handleView = async (row) => {
  isAdd.value = false
  dialogTitle.value = '订单详情'
  detail.value = await orders.get(row.id)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    await orders.create(form)
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
