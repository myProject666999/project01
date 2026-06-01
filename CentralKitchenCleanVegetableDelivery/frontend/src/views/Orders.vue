<template>
  <div class="orders">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单列表</span>
          <el-button type="primary" @click="openDialog">
            <el-icon><Plus /></el-icon>
            新增订单
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-form :inline="true">
          <el-form-item label="配送日期">
            <el-date-picker v-model="filterDate" type="date" placeholder="选择日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-table :data="orders" style="width: 100%">
        <el-table-column prop="order_no" label="订单编号" width="180" />
        <el-table-column prop="customer.name" label="客户名称" />
        <el-table-column prop="delivery_date" label="配送日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.delivery_date) }}
          </template>
        </el-table-column>
        <el-table-column label="菜品明细">
          <template #default="{ row }">
            <div v-for="item in row.order_items" :key="item.id" class="order-item">
              {{ item.product?.name }}: {{ item.quantity }}{{ item.product?.unit }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="total_amount" label="总金额" width="100">
          <template #default="{ row }">
            ¥{{ row.total_amount }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-dropdown v-if="row.status === 0" @command="(cmd) => updateStatus(row, cmd)">
              <el-button link type="primary">状态操作</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="1">确认订单</el-dropdown-item>
                  <el-dropdown-item :command="5">取消订单</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-tag v-else type="info">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增订单" width="700px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="客户" prop="customer_id">
          <el-select v-model="form.customer_id" placeholder="请选择客户" style="width: 100%" @change="onCustomerChange">
            <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="配送日期" prop="delivery_date">
          <el-date-picker v-model="form.delivery_date" type="date" placeholder="选择配送日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="菜品明细" prop="items">
          <div class="items-container">
            <div v-for="(item, index) in form.items" :key="index" class="item-row">
              <el-select v-model="item.product_id" placeholder="选择菜品" style="width: 200px" @change="() => calculateItemTotal(index)">
                <el-option v-for="p in products" :key="p.id" :label="p.name" :value="p.id" />
              </el-select>
              <el-input-number v-model="item.quantity" :min="0" :step="0.5" placeholder="数量" style="width: 120px; margin: 0 10px" @change="() => calculateItemTotal(index)" />
              <span>kg</span>
              <el-button link type="danger" @click="removeItem(index)" style="margin-left: 20px">删除</el-button>
            </div>
            <el-button type="dashed" @click="addItem" style="width: 100%; margin-top: 10px">
              <el-icon><Plus /></el-icon>
              添加菜品
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="总金额">
          <span style="font-size: 18px; font-weight: bold; color: #f56c6c">¥{{ totalAmount }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOrders, createOrder, updateOrderStatus, getCustomers, getProducts } from '@/api'

const orders = ref([])
const customers = ref([])
const products = ref([])
const dialogVisible = ref(false)
const formRef = ref(null)
const filterDate = ref('')

const form = reactive({
  customer_id: null,
  delivery_date: '',
  remark: '',
  items: [{ product_id: null, quantity: 0 }]
})

const rules = {
  customer_id: [{ required: true, message: '请选择客户', trigger: 'change' }],
  delivery_date: [{ required: true, message: '请选择配送日期', trigger: 'change' }]
}

const totalAmount = computed(() => {
  return form.items.reduce((total, item) => {
    const product = products.value.find(p => p.id === item.product_id)
    return total + (product?.price || 0) * item.quantity
  }, 0).toFixed(2)
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const getStatusType = (status) => {
  const types = ['info', 'warning', 'primary', 'success', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待确认', '已确认', '加工中', '配送中', '已完成', '已取消']
  return texts[status] || '未知'
}

const loadData = async () => {
  try {
    const params = {}
    if (filterDate.value) params.delivery_date = filterDate.value
    
    const res = await getOrders(params)
    orders.value = res.data || []
  } catch (error) {
    console.error('加载订单列表失败', error)
  }
}

const resetFilter = () => {
  filterDate.value = ''
  loadData()
}

const openDialog = () => {
  form.customer_id = null
  form.delivery_date = ''
  form.remark = ''
  form.items = [{ product_id: null, quantity: 0 }]
  dialogVisible.value = true
}

const addItem = () => {
  form.items.push({ product_id: null, quantity: 0 })
}

const removeItem = (index) => {
  if (form.items.length > 1) {
    form.items.splice(index, 1)
  }
}

const calculateItemTotal = (index) => {
}

const onCustomerChange = () => {
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  
  try {
    const validItems = form.items.filter(item => item.product_id && item.quantity > 0)
    if (validItems.length === 0) {
      ElMessage.error('请至少添加一个有效菜品')
      return
    }
    
    await createOrder({
      customer_id: form.customer_id,
      delivery_date: form.delivery_date,
      remark: form.remark,
      items: validItems
    })
    
    ElMessage.success('订单创建成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('创建订单失败', error)
  }
}

const updateStatus = async (row, status) => {
  try {
    await updateOrderStatus(row.id, status)
    ElMessage.success('状态更新成功')
    loadData()
  } catch (error) {
    console.error('更新状态失败', error)
  }
}

onMounted(async () => {
  loadData()
  const [custRes, prodRes] = await Promise.all([
    getCustomers(),
    getProducts()
  ])
  customers.value = custRes.data || []
  products.value = prodRes.data || []
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

.item-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.order-item {
  font-size: 12px;
  color: #666;
  margin: 2px 0;
}
</style>
