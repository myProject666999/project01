<template>
  <div class="page">
    <el-card>
      <template #header>
        <span>波次拣货</span>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待拣货" :value="0" />
            <el-option label="拣货中" :value="1" />
            <el-option label="拣货完成" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="wave_no" label="波次号" width="180" />
        <el-table-column prop="order_count" label="订单数" width="100" />
        <el-table-column prop="total_qty" label="总数量" width="100" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="picker" label="拣货员" width="100" />
        <el-table-column prop="picked_at" label="完成时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" v-if="row.status < 2" @click="handlePick(row)">
              拣货
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px">
      <el-descriptions :column="3" border v-if="detail.id">
        <el-descriptions-item label="波次号">{{ detail.wave_no }}</el-descriptions-item>
        <el-descriptions-item label="订单数">{{ detail.order_count }}</el-descriptions-item>
        <el-descriptions-item label="总数量">{{ detail.total_qty }}</el-descriptions-item>
      </el-descriptions>
      
      <h4 style="margin: 20px 0 10px">包含订单</h4>
      <el-table :data="detail.orders || []" border size="small" style="margin-bottom: 20px">
        <el-table-column prop="order_no" label="订单号" width="150" />
        <el-table-column prop="customer_name" label="客户" width="100" />
        <el-table-column prop="address" label="地址" show-overflow-tooltip />
      </el-table>
      
      <h4 style="margin: 20px 0 10px">拣货明细（按库位排序）</h4>
      <el-table :data="detail.items || []" border size="small">
        <el-table-column prop="location_code" label="库位" width="120" />
        <el-table-column prop="order_no" label="所属订单" width="150" />
        <el-table-column prop="sku" label="SKU" width="120" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="quantity" label="应拣数量" width="100" />
        <el-table-column prop="picked_qty" label="已拣数量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ row.status === 1 ? '已拣' : '待拣' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="isPick" label="操作" width="120">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 0" 
              size="small" 
              type="primary" 
              @click="confirmPick(row)"
            >
              确认拣货
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { waves } from '../api'

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isPick = ref(false)

const searchForm = reactive({
  status: undefined
})

const detail = ref({ items: [], orders: [] })

const getStatusType = (status) => {
  const types = ['warning', 'primary', 'success', 'danger']
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = ['待拣货', '拣货中', '拣货完成', '已取消']
  return texts[status] || '未知'
}

const loadData = async () => {
  try {
    const params = {}
    if (searchForm.status !== undefined && searchForm.status !== '') {
      params.status = searchForm.status
    }
    const data = await waves.list(params)
    tableData.value = data
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

const resetSearch = () => {
  searchForm.status = undefined
  loadData()
}

const handleView = async (row) => {
  isPick.value = false
  dialogTitle.value = '波次详情'
  detail.value = await waves.get(row.id)
  dialogVisible.value = true
}

const handlePick = async (row) => {
  isPick.value = true
  dialogTitle.value = '拣货操作'
  detail.value = await waves.get(row.id)
  dialogVisible.value = true
}

const confirmPick = async (item) => {
  ElMessageBox.confirm(`确认拣货 ${item.name} x ${item.quantity}?`, '提示', {
    type: 'info'
  }).then(async () => {
    try {
      await waves.pick(detail.value.id, {
        item_id: item.id,
        picked_qty: item.quantity
      })
      ElMessage.success('拣货成功')
      detail.value = await waves.get(detail.value.id)
      loadData()
    } catch (error) {
      ElMessage.error('拣货失败')
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
}
</style>
