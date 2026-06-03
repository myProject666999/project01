<template>
  <div class="deliveries">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>配送单列表</span>
          <el-button type="primary" @click="generateDeliveries">
            <el-icon><Refresh /></el-icon>
            生成配送单
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
      
      <el-table :data="deliveries" style="width: 100%">
        <el-table-column prop="delivery_no" label="配送单编号" width="180" />
        <el-table-column prop="vehicle.plate_number" label="车牌号" width="120" />
        <el-table-column prop="vehicle.driver_name" label="司机" width="100" />
        <el-table-column prop="delivery_date" label="配送日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.delivery_date) }}
          </template>
        </el-table-column>
        <el-table-column label="出发时间" width="200">
          <template #default="{ row }">
            <div>计划: {{ formatDateTime(row.plan_depart_time) }}</div>
            <div>实际: {{ formatDateTime(row.actual_depart_time) }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row)">查看详情</el-button>
            <el-dropdown v-if="row.status !== 2" @command="(cmd) => updateStatus(row, cmd)">
              <el-button link type="success">状态操作</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="1" v-if="row.status === 0">开始配送</el-dropdown-item>
                  <el-dropdown-item :command="2" v-if="row.status === 1">完成配送</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="generateDialogVisible" title="生成配送单" width="400px">
      <el-form :model="generateForm" label-width="100px">
        <el-form-item label="配送日期">
          <el-date-picker v-model="generateForm.delivery_date" type="date" placeholder="选择配送日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="generateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmGenerate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="配送详情" width="800px">
      <div v-if="currentDelivery">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="配送单编号">{{ currentDelivery.delivery_no }}</el-descriptions-item>
          <el-descriptions-item label="车牌号">{{ currentDelivery.vehicle?.plate_number }}</el-descriptions-item>
          <el-descriptions-item label="司机">{{ currentDelivery.vehicle?.driver_name }}</el-descriptions-item>
          <el-descriptions-item label="司机电话">{{ currentDelivery.vehicle?.driver_phone }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 20px 0 10px">配送客户列表</h4>
        <el-table :data="currentDelivery.delivery_items" style="width: 100%">
          <el-table-column prop="sequence" label="顺序" width="80" />
          <el-table-column prop="customer.name" label="客户名称" />
          <el-table-column prop="customer.address" label="地址" />
          <el-table-column label="订单菜品">
            <template #default="{ row }">
              <div v-for="item in row.order?.order_items" :key="item.id" class="order-item">
                {{ item.product?.name }}: {{ item.quantity }}{{ item.product?.unit }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="sign_person" label="签收人" width="100" />
          <el-table-column prop="sign_time" label="签收时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.sign_time) }}
            </template>
          </el-table-column>
          <el-table-column label="温度确认" width="100">
            <template #default="{ row }">
              <el-tag :type="row.temperature_confirmed ? 'success' : 'info'">
                {{ row.temperature_confirmed ? '已确认' : '未确认' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button v-if="!row.sign_time" link type="primary" @click="openSignDialog(row)">签收</el-button>
            </template>
          </el-table-column>
        </el-table>

        <h4 style="margin: 20px 0 10px">温度记录</h4>
        <el-table :data="temperatureRecords" style="width: 100%">
          <el-table-column prop="record_time" label="记录时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.record_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="temperature" label="温度(℃)" width="120" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="signDialogVisible" title="客户签收" width="400px">
      <el-form :model="signForm" label-width="100px">
        <el-form-item label="签收人">
          <el-input v-model="signForm.sign_person" placeholder="请输入签收人" />
        </el-form-item>
        <el-form-item label="温度确认">
          <el-radio-group v-model="signForm.temperature_confirmed">
            <el-radio :label="1">温度正常</el-radio>
            <el-radio :label="0">温度异常</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="signDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDeliveries, getDeliveryDetail, generateDeliveries as apiGenerateDeliveries, updateDeliveryStatus, signDeliveryItem, getTemperatureRecords } from '@/api'

const deliveries = ref([])
const filterDate = ref('')
const generateDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const signDialogVisible = ref(false)
const currentDelivery = ref(null)
const currentDeliveryItem = ref(null)
const temperatureRecords = ref([])

const generateForm = reactive({
  delivery_date: ''
})

const signForm = reactive({
  sign_person: '',
  temperature_confirmed: 1
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

const getStatusType = (status) => {
  const types = ['info', 'warning', 'success']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待发车', '配送中', '已完成']
  return texts[status] || '未知'
}

const loadData = async () => {
  const params = {}
  if (filterDate.value) params.date = filterDate.value
  
  getDeliveries(params).then(res => {
    deliveries.value = res.data || []
  }).catch(err => {
      console.error('加载配送单失败', err)
    })
}

const resetFilter = () => {
  filterDate.value = ''
  loadData()
}

const generateDeliveries = () => {
  generateForm.delivery_date = ''
  generateDialogVisible.value = true
}

const confirmGenerate = async () => {
  if (!generateForm.delivery_date) {
    ElMessage.error('请选择配送日期')
    return
  }
  
  try {
    await apiGenerateDeliveries(generateForm)
    ElMessage.success('配送单生成成功')
    generateDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('生成配送单失败', error)
  }
}

const viewDetail = async (row) => {
  try {
    const res = await getDeliveryDetail(row.id)
    currentDelivery.value = res.data
    detailDialogVisible.value = true
    
    const tempRes = await getTemperatureRecords({ delivery_id: row.id })
    temperatureRecords.value = tempRes.data || []
  } catch (error) {
    console.error('加载配送详情失败', error)
  }
}

const updateStatus = async (row, status) => {
  try {
    await updateDeliveryStatus(row.id, status)
    ElMessage.success('状态更新成功')
    loadData()
  } catch (error) {
    console.error('更新状态失败', error)
  }
}

const openSignDialog = (item) => {
  currentDeliveryItem.value = item
  signForm.sign_person = ''
  signForm.temperature_confirmed = 1
  signDialogVisible.value = true
}

const confirmSign = async () => {
  if (!signForm.sign_person) {
    ElMessage.error('请输入签收人')
    return
  }
  
  try {
    await signDeliveryItem(currentDeliveryItem.value.id, signForm)
    ElMessage.success('签收成功')
    signDialogVisible.value = false
    viewDetail({ id: currentDelivery.value.id })
  } catch (error) {
    console.error('签收失败', error)
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

.filter-bar {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.order-item {
  font-size: 12px;
  color: #666;
  margin: 2px 0;
}
</style>
