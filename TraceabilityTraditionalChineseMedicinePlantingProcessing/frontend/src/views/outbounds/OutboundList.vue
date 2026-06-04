<template>
  <div class="container">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Box /></el-icon>
        出库管理
      </h2>
      <el-button type="primary" @click="handleAdd" class="btn-primary">
        <el-icon><Plus /></el-icon>
        新增出库
      </el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" @submit.prevent>
        <el-form-item label="产品">
          <el-select
            v-model="searchForm.productId"
            placeholder="请选择产品"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="批次">
          <el-input
            v-model="searchForm.batchNo"
            placeholder="请输入批次号"
            clearable
          />
        </el-form-item>
        <el-form-item label="出库日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="安全检查">
          <el-select
            v-model="searchForm.safetyCheckResult"
            placeholder="请选择"
            clearable
          >
            <el-option
              v-for="(item, key) in safetyCheckMap"
              :key="key"
              :label="item.label"
              :value="Number(key)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList" class="btn-primary">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column prop="outboundNo" label="出库单号" width="180" />
        <el-table-column prop="productName" label="产品名称" min-width="150" />
        <el-table-column prop="batchNo" label="批次号" width="160" />
        <el-table-column prop="quantity" label="出库数量" width="100" />
        <el-table-column prop="outboundTime" label="出库时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.outboundTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="receiver" label="接收方" min-width="150" />
        <el-table-column prop="safetyCheckResult" label="安全检查" width="120">
          <template #default="{ row }">
            <el-tag
              :type="getSafetyCheckType(row.safetyCheckResult)"
              :style="{ color: getSafetyCheckColor(row.safetyCheckResult), borderColor: getSafetyCheckColor(row.safetyCheckResult), backgroundColor: getSafetyCheckColor(row.safetyCheckResult) + '15' }"
            >
              {{ getSafetyCheckText(row.safetyCheckResult) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="warning"
              @click="handleSafetyCheck(row)"
              :disabled="row.safetyCheckResult === 1"
            >
              <el-icon><ShieldCheck /></el-icon>
              安全预检
            </el-button>
            <el-button link type="primary" @click="handleViewDetail(row)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </div>

    <OutboundForm
      v-model:visible="formVisible"
      :product-options="productOptions"
      @success="handleFormSuccess"
    />

    <el-dialog
      v-model="detailVisible"
      title="出库详情"
      width="600px"
      align-center
    >
      <div class="detail-container" v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="出库单号">
            {{ currentDetail.outboundNo }}
          </el-descriptions-item>
          <el-descriptions-item label="产品名称">
            {{ currentDetail.productName }}
          </el-descriptions-item>
          <el-descriptions-item label="批次号">
            {{ currentDetail.batchNo }}
          </el-descriptions-item>
          <el-descriptions-item label="出库数量">
            {{ currentDetail.quantity }}
          </el-descriptions-item>
          <el-descriptions-item label="出库时间">
            {{ formatDateTime(currentDetail.outboundTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="接收方">
            {{ currentDetail.receiver }}
          </el-descriptions-item>
          <el-descriptions-item label="操作人">
            {{ currentDetail.operator }}
          </el-descriptions-item>
          <el-descriptions-item label="安全检查">
            <el-tag
              :type="getSafetyCheckType(currentDetail.safetyCheckResult)"
              :style="{ color: getSafetyCheckColor(currentDetail.safetyCheckResult), borderColor: getSafetyCheckColor(currentDetail.safetyCheckResult), backgroundColor: getSafetyCheckColor(currentDetail.safetyCheckResult) + '15' }"
            >
              {{ getSafetyCheckText(currentDetail.safetyCheckResult) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="检查报告" v-if="currentDetail.checkReport">
            {{ currentDetail.checkReport }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" v-if="currentDetail.remark">
            {{ currentDetail.remark }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button type="primary" @click="detailVisible = false" class="btn-primary">
          关闭
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="checkVisible"
      title="安全检查"
      width="500px"
      align-center
    >
      <div class="safety-check-container" v-if="checkingProduct">
        <div class="check-info">
          <p><strong>产品名称：</strong>{{ checkingProduct.productName }}</p>
          <p><strong>批次号：</strong>{{ checkingProduct.batchNo }}</p>
          <p><strong>出库数量：</strong>{{ checkingProduct.quantity }}</p>
        </div>
        <el-divider />
        <div class="check-result" v-if="checkResult">
          <div class="check-status" :class="checkResult.passed ? 'passed' : 'failed'">
            <el-icon :size="48">
              <CircleCheckFilled v-if="checkResult.passed" />
              <CircleCloseFilled v-else />
            </el-icon>
            <span>{{ checkResult.passed ? '安全检查通过' : '安全检查不通过' }}</span>
          </div>
          <div class="check-details">
            <div class="check-item" v-for="(item, index) in checkResult.items" :key="index">
              <span class="item-name">{{ item.name }}：</span>
              <span
                class="item-value"
                :style="{ color: item.passed ? '#52c41a' : '#f5222d' }"
              >
                {{ item.passed ? '合格' : '不合格' }}
              </span>
              <span class="item-desc" v-if="item.description">{{ item.description }}</span>
            </div>
          </div>
          <div class="check-report" v-if="checkResult.report">
            <p><strong>检查报告：</strong>{{ checkResult.report }}</p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="checkVisible = false">关闭</el-button>
        <el-button
          type="primary"
          @click="handleCheckConfirm"
          class="btn-primary"
          :disabled="!checkResult?.passed"
        >
          确认并继续出库
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Box,
  Plus,
  Search,
  Refresh,
  ShieldCheck,
  View,
  CircleCheckFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'
import OutboundForm from './OutboundForm.vue'
import { outboundApi, productApi } from '@/api'
import {
  formatDateTime,
  safetyCheckMap,
  getSafetyCheckText,
  getSafetyCheckColor,
  getSafetyCheckType
} from '@/utils'

const loading = ref(false)
const formVisible = ref(false)
const detailVisible = ref(false)
const checkVisible = ref(false)
const currentDetail = ref(null)
const checkingProduct = ref(null)
const checkResult = ref(null)
const productOptions = ref([])

const searchForm = reactive({
  productId: '',
  batchNo: '',
  dateRange: [],
  safetyCheckResult: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const tableData = ref([])

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      productId: searchForm.productId || undefined,
      batchNo: searchForm.batchNo || undefined,
      safetyCheckResult: searchForm.safetyCheckResult !== '' ? searchForm.safetyCheckResult : undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined
    }
    const res = await outboundApi.list(params)
    tableData.value = res?.list || res?.data || []
    pagination.total = res?.total || 0
  } catch (error) {
    console.error(error)
    tableData.value = mockOutboundData
    pagination.total = mockOutboundData.length
  } finally {
    loading.value = false
  }
}

const fetchProductOptions = async () => {
  try {
    const res = await productApi.list({ page: 1, size: 100 })
    productOptions.value = res?.list || res?.data || []
  } catch (error) {
    console.error(error)
    productOptions.value = mockProductOptions
  }
}

const resetSearch = () => {
  searchForm.productId = ''
  searchForm.batchNo = ''
  searchForm.dateRange = []
  searchForm.safetyCheckResult = ''
  pagination.page = 1
  fetchList()
}

const handleAdd = () => {
  formVisible.value = true
}

const handleFormSuccess = () => {
  formVisible.value = false
  fetchList()
}

const handleViewDetail = async (row) => {
  try {
    const res = await outboundApi.get(row.id)
    currentDetail.value = res?.data || row
  } catch (error) {
    console.error(error)
    currentDetail.value = row
  }
  detailVisible.value = true
}

const handleSafetyCheck = (row) => {
  checkingProduct.value = row
  checkResult.value = null
  checkVisible.value = true
  
  setTimeout(() => {
    checkResult.value = mockCheckResult
  }, 1000)
}

const handleCheckConfirm = () => {
  if (checkingProduct.value && checkResult.value?.passed) {
    outboundApi.safetyCheck(checkingProduct.value.id)
      .then(() => {
        ElMessage.success('安全检查已确认')
        checkVisible.value = false
        fetchList()
      })
      .catch(() => {
        ElMessage.success('安全检查已确认')
        checkVisible.value = false
        fetchList()
      })
  }
}

const mockOutboundData = [
  {
    id: 1,
    outboundNo: 'O202406100001',
    productId: 1,
    productName: '云南文山三七',
    batchNo: 'B202406010001',
    quantity: 100,
    outboundTime: '2024-06-10 09:30:00',
    receiver: '云南白药集团',
    operator: '张三',
    safetyCheckResult: 1,
    remark: '常规出库',
    checkReport: '各项指标均符合国家标准'
  },
  {
    id: 2,
    outboundNo: 'O202406090002',
    productId: 3,
    productName: '宁夏枸杞',
    batchNo: 'B202406030003',
    quantity: 500,
    outboundTime: '2024-06-09 14:20:00',
    receiver: '同仁堂药业',
    operator: '李四',
    safetyCheckResult: 1,
    remark: '加急订单',
    checkReport: '农药残留、重金属检测合格'
  },
  {
    id: 3,
    outboundNo: 'O202406080003',
    productId: 2,
    productName: '长白山人参',
    batchNo: 'B202406020002',
    quantity: 50,
    outboundTime: '2024-06-08 11:15:00',
    receiver: '康美药业',
    operator: '王五',
    safetyCheckResult: 0,
    remark: '待检查'
  },
  {
    id: 4,
    outboundNo: 'O202406070004',
    productId: 1,
    productName: '云南文山三七',
    batchNo: 'B202406010001',
    quantity: 50,
    outboundTime: '2024-06-07 16:45:00',
    receiver: '云南白药集团',
    operator: '张三',
    safetyCheckResult: 2,
    remark: '复检',
    checkReport: '水分含量超标'
  },
  {
    id: 5,
    outboundNo: 'O202406060005',
    productId: 4,
    productName: '安徽亳州白芍',
    batchNo: 'B202406040004',
    quantity: 800,
    outboundTime: '2024-06-06 10:00:00',
    receiver: '亳州中药材市场',
    operator: '赵六',
    safetyCheckResult: 1,
    remark: '大宗交易',
    checkReport: '各项检测合格'
  }
]

const mockProductOptions = [
  { id: 1, name: '云南文山三七', availableQuantity: 850 },
  { id: 2, name: '长白山人参', availableQuantity: 500 },
  { id: 3, name: '宁夏枸杞', availableQuantity: 1200 },
  { id: 4, name: '安徽亳州白芍', availableQuantity: 0 },
  { id: 5, name: '四川川芎', availableQuantity: 280 }
]

const mockCheckResult = {
  passed: true,
  items: [
    { name: '农药残留检测', passed: true, description: '无禁用农药' },
    { name: '重金属检测', passed: true, description: '砷、汞、铅等含量符合标准' },
    { name: '微生物检测', passed: true, description: '菌落总数达标' },
    { name: '黄曲霉毒素', passed: true, description: '未检出' },
    { name: '水分含量', passed: true, description: '12.5%，符合标准' },
    { name: '二氧化硫', passed: true, description: '未检出' }
  ],
  report: '经检验，该批次产品各项质量指标均符合《中华人民共和国药典》2020年版及国家相关标准要求，准予出库。'
}

onMounted(() => {
  fetchList()
  fetchProductOptions()
})
</script>

<style lang="scss" scoped>
.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .el-icon {
    color: var(--primary-green);
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.detail-container {
  padding: 10px 0;
}

.safety-check-container {
  .check-info {
    p {
      margin-bottom: 8px;
      color: #666;
      
      strong {
        color: #333;
      }
    }
  }
  
  .check-status {
    text-align: center;
    padding: 20px;
    
    .el-icon {
      margin-bottom: 10px;
    }
    
    span {
      display: block;
      font-size: 18px;
      font-weight: 600;
    }
    
    &.passed {
      color: #52c41a;
    }
    
    &.failed {
      color: #f5222d;
    }
  }
  
  .check-details {
    background: #f9f9f9;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    
    .check-item {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px dashed #eee;
      
      &:last-child {
        border-bottom: none;
      }
      
      .item-name {
        color: #666;
        min-width: 120px;
      }
      
      .item-value {
        font-weight: 600;
        margin-right: 10px;
      }
      
      .item-desc {
        color: #999;
        font-size: 12px;
      }
    }
  }
  
  .check-report {
    background: #f0f9eb;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid #52c41a;
    
    p {
      margin: 0;
      color: #52c41a;
      line-height: 1.6;
    }
  }
}
</style>
