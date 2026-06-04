<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库存盘点</span>
          <el-button type="primary" @click="handleCreateStocktake">创建盘点单</el-button>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="库存查询" name="inventory">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item label="关键词">
              <el-input v-model="searchForm.keyword" placeholder="SKU/条码/名称" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadInventory">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="inventoryData" border stripe>
            <el-table-column prop="sku" label="SKU" width="120" />
            <el-table-column prop="barcode" label="条码" width="150" />
            <el-table-column prop="name" label="商品名称" min-width="200" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="location_code" label="库位" width="120" />
            <el-table-column prop="quantity" label="库存数量" width="100" />
            <el-table-column prop="available_qty" label="可用数量" width="100" />
            <el-table-column prop="locked_qty" label="锁定数量" width="100" />
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="盘点单" name="stocktake">
          <el-form :inline="true" :model="stocktakeSearchForm" class="search-form">
            <el-form-item label="状态">
              <el-select v-model="stocktakeSearchForm.status" placeholder="请选择" clearable style="width: 150px">
                <el-option label="进行中" :value="0" />
                <el-option label="已完成" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadStocktakes">搜索</el-button>
              <el-button @click="resetStocktakeSearch">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="stocktakeData" border stripe>
            <el-table-column prop="stocktake_no" label="盘点单号" width="180" />
            <el-table-column prop="type" label="盘点类型" width="100">
              <template #default="{ row }">{{ row.type === 0 ? '全盘' : '抽盘' }}</template>
            </el-table-column>
            <el-table-column prop="total_skus" label="SKU数" width="100" />
            <el-table-column prop="difference_count" label="差异数" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'warning' : 'success'">
                  {{ row.status === 0 ? '进行中' : '已完成' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="操作员" width="100" />
            <el-table-column prop="started_at" label="开始时间" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="handleViewStocktake(row)">查看</el-button>
                <el-button 
                  size="small" 
                  type="primary" 
                  v-if="row.status === 0" 
                  @click="handleDoStocktake(row)"
                >
                  盘点
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="stocktakeDialogVisible" :title="stocktakeDialogTitle" width="900px">
      <el-descriptions :column="3" border v-if="stocktakeDetail.id">
        <el-descriptions-item label="盘点单号">{{ stocktakeDetail.stocktake_no }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ stocktakeDetail.type === 0 ? '全盘' : '抽盘' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="stocktakeDetail.status === 0 ? 'warning' : 'success'">
            {{ stocktakeDetail.status === 0 ? '进行中' : '已完成' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="SKU数">{{ stocktakeDetail.total_skus }}</el-descriptions-item>
        <el-descriptions-item label="差异数">{{ stocktakeDetail.difference_count }}</el-descriptions-item>
        <el-descriptions-item label="操作员">{{ stocktakeDetail.operator }}</el-descriptions-item>
      </el-descriptions>
      
      <h4 style="margin: 20px 0 10px">盘点明细</h4>
      <el-table :data="stocktakeDetail.items || []" border size="small">
        <el-table-column prop="location_code" label="库位" width="120" />
        <el-table-column prop="sku" label="SKU" width="120" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="system_qty" label="系统数量" width="100" />
        <el-table-column v-if="isDoingStocktake" label="实际数量" width="150">
          <template #default="{ row, $index }">
            <el-input-number 
              v-model="stocktakeDetail.items[$index].actual_qty" 
              :min="0" 
              size="small"
              :disabled="row.status === 1"
            />
          </template>
        </el-table-column>
        <el-table-column v-else prop="actual_qty" label="实际数量" width="100" />
        <el-table-column prop="difference" label="差异" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.difference > 0" type="danger">+{{ row.difference }}</el-tag>
            <el-tag v-else-if="row.difference < 0" type="warning">{{ row.difference }}</el-tag>
            <el-tag v-else type="success">0</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ row.status === 1 ? '已盘' : '待盘' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="isDoingStocktake" label="操作" width="150">
          <template #default="{ row, $index }">
            <el-button 
              v-if="row.status === 0" 
              size="small" 
              type="primary" 
              @click="saveStocktakeItem(row, $index)"
            >
              录入
            </el-button>
            <el-button 
              v-if="row.status === 1 && row.difference !== 0 && stocktakeDetail.status === 1"
              size="small" 
              type="danger" 
              @click="adjustInventory(row)"
            >
              调整库存
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <el-button @click="stocktakeDialogVisible = false">关闭</el-button>
        <el-button 
          v-if="isDoingStocktake && stocktakeDetail.status === 0" 
          type="success" 
          @click="completeStocktake"
        >
          完成盘点
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="createStocktakeDialog" title="创建盘点单" width="500px">
      <el-form :model="newStocktakeForm" label-width="100px">
        <el-form-item label="盘点类型">
          <el-radio-group v-model="newStocktakeForm.type">
            <el-radio :value="0">全盘</el-radio>
            <el-radio :value="1">抽盘</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="操作员">
          <el-input v-model="newStocktakeForm.operator" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="newStocktakeForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createStocktakeDialog = false">取消</el-button>
        <el-button type="primary" @click="createStocktake">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { inventory } from '../api'

const activeTab = ref('inventory')
const inventoryData = ref([])
const stocktakeData = ref([])
const stocktakeDialogVisible = ref(false)
const createStocktakeDialog = ref(false)
const stocktakeDialogTitle = ref('')
const isDoingStocktake = ref(false)

const searchForm = reactive({
  keyword: ''
})

const stocktakeSearchForm = reactive({
  status: undefined
})

const stocktakeDetail = ref({ items: [] })
const newStocktakeForm = reactive({
  type: 0,
  operator: '',
  remark: ''
})

const loadInventory = async () => {
  try {
    const data = await inventory.list(searchForm)
    inventoryData.value = data
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

const loadStocktakes = async () => {
  try {
    const params = {}
    if (stocktakeSearchForm.status !== undefined && stocktakeSearchForm.status !== '') {
      params.status = stocktakeSearchForm.status
    }
    const data = await inventory.stocktakeList(params)
    stocktakeData.value = data
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  loadInventory()
}

const resetStocktakeSearch = () => {
  stocktakeSearchForm.status = undefined
  loadStocktakes()
}

const handleCreateStocktake = () => {
  newStocktakeForm.type = 0
  newStocktakeForm.operator = ''
  newStocktakeForm.remark = ''
  createStocktakeDialog.value = true
}

const createStocktake = async () => {
  try {
    await inventory.stocktakeCreate(newStocktakeForm)
    ElMessage.success('盘点单创建成功')
    createStocktakeDialog.value = false
    loadStocktakes()
  } catch (error) {
    ElMessage.error('创建失败')
  }
}

const handleViewStocktake = async (row) => {
  isDoingStocktake.value = false
  stocktakeDialogTitle.value = '盘点单详情'
  stocktakeDetail.value = await inventory.stocktakeGet(row.id)
  stocktakeDialogVisible.value = true
}

const handleDoStocktake = async (row) => {
  isDoingStocktake.value = true
  stocktakeDialogTitle.value = '盘点操作'
  stocktakeDetail.value = await inventory.stocktakeGet(row.id)
  stocktakeDialogVisible.value = true
}

const saveStocktakeItem = async (row, index) => {
  try {
    await inventory.stocktakeScan(stocktakeDetail.value.id, {
      item_id: row.id,
      actual_qty: row.actual_qty
    })
    ElMessage.success('录入成功')
    stocktakeDetail.value = await inventory.stocktakeGet(stocktakeDetail.value.id)
  } catch (error) {
    ElMessage.error('录入失败')
  }
}

const completeStocktake = async () => {
  ElMessageBox.confirm('确认完成盘点?', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await inventory.stocktakeComplete(stocktakeDetail.value.id)
      ElMessage.success('盘点完成')
      stocktakeDetail.value = await inventory.stocktakeGet(stocktakeDetail.value.id)
      loadStocktakes()
    } catch (error) {
      ElMessage.error('完成失败')
    }
  })
}

const adjustInventory = async (row) => {
  ElMessageBox.confirm('确认调整库存?', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await inventory.stocktakeAdjust(stocktakeDetail.value.id, {
        item_id: row.id
      })
      ElMessage.success('库存调整成功')
      stocktakeDetail.value = await inventory.stocktakeGet(stocktakeDetail.value.id)
    } catch (error) {
      ElMessage.error('调整失败')
    }
  })
}

onMounted(() => {
  loadInventory()
  loadStocktakes()
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
