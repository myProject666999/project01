<template>
  <div class="container">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><Goods /></el-icon>
        产品管理
      </h2>
      <el-button type="primary" @click="handleAdd" class="btn-primary">
        <el-icon><Plus /></el-icon>
        新增产品
      </el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" @submit.prevent>
        <el-form-item label="批次">
          <el-input
            v-model="searchForm.batchNo"
            placeholder="请输入批次号"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option
              v-for="(item, key) in productStatusMap"
              :key="key"
              :label="item.label"
              :value="Number(key)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入产品名称"
            clearable
          />
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
        <el-table-column prop="productNo" label="产品编号" width="180" />
        <el-table-column prop="name" label="产品名称" min-width="150" />
        <el-table-column prop="batchNo" label="批次号" width="160" />
        <el-table-column prop="specification" label="规格" width="120" />
        <el-table-column prop="packagingType" label="包装类型" width="120" />
        <el-table-column prop="netWeight" label="净重" width="100">
          <template #default="{ row }">
            {{ formatWeight(row.netWeight) }}
          </template>
        </el-table-column>
        <el-table-column prop="productionDate" label="生产日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.productionDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="shelfLife" label="保质期" width="100">
          <template #default="{ row }">
            {{ row.shelfLife ? row.shelfLife + '个月' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="totalQuantity" label="总数量" width="100" />
        <el-table-column prop="availableQuantity" label="可用数量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getProductStatusType(row.status)">
              {{ getProductStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button link type="success" @click="handleGenerateQrcode(row)">
              <el-icon><QrCode /></el-icon>
              生成二维码
            </el-button>
            <el-button link type="info" @click="handleViewQrcode(row)">
              <el-icon><View /></el-icon>
              查看二维码
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

    <ProductForm
      v-model:visible="formVisible"
      :form-data="currentFormData"
      :batch-options="batchOptions"
      @success="handleFormSuccess"
    />

    <el-dialog
      v-model="qrcodeVisible"
      title="产品二维码"
      width="400px"
      align-center
    >
      <div class="qrcode-container" v-if="qrcodeImage">
        <img :src="qrcodeImage" alt="产品二维码" />
        <p class="qrcode-tip">扫描二维码查看产品溯源信息</p>
      </div>
      <template #footer>
        <el-button @click="downloadQrcode">
          <el-icon><Download /></el-icon>
          下载二维码
        </el-button>
        <el-button type="primary" @click="qrcodeVisible = false" class="btn-primary">
          关闭
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Goods, Plus, Search, Refresh, Edit, QrCode, View, Download } from '@element-plus/icons-vue'
import ProductForm from './ProductForm.vue'
import { productApi, batchApi } from '@/api'
import {
  formatDate,
  formatWeight,
  productStatusMap,
  getProductStatusText,
  getProductStatusType,
  downloadFile
} from '@/utils'

const loading = ref(false)
const formVisible = ref(false)
const qrcodeVisible = ref(false)
const currentFormData = ref(null)
const qrcodeImage = ref('')
const batchOptions = ref([])

const searchForm = reactive({
  batchNo: '',
  status: '',
  name: ''
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
      ...searchForm
    }
    const res = await productApi.list(params)
    tableData.value = res?.list || res?.data || []
    pagination.total = res?.total || 0
  } catch (error) {
    ElMessage.error('获取产品列表失败')
    console.error(error)
    tableData.value = mockProductData
    pagination.total = mockProductData.length
  } finally {
    loading.value = false
  }
}

const fetchBatchOptions = async () => {
  try {
    const res = await batchApi.list({ page: 1, size: 100 })
    batchOptions.value = res?.list || res?.data || []
  } catch (error) {
    console.error(error)
    batchOptions.value = mockBatchData
  }
}

const resetSearch = () => {
  searchForm.batchNo = ''
  searchForm.status = ''
  searchForm.name = ''
  pagination.page = 1
  fetchList()
}

const handleAdd = () => {
  currentFormData.value = null
  formVisible.value = true
}

const handleEdit = (row) => {
  currentFormData.value = { ...row }
  formVisible.value = true
}

const handleFormSuccess = () => {
  formVisible.value = false
  fetchList()
}

const handleGenerateQrcode = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要为产品"${row.name}"生成二维码吗？`,
      '生成确认',
      { type: 'warning' }
    )
    const res = await productApi.generateQrcode(row.id)
    qrcodeImage.value = res?.qrcodeUrl || res?.data?.qrcodeUrl || mockQrcode
    qrcodeVisible.value = true
    ElMessage.success('二维码生成成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('二维码生成失败')
      console.error(error)
      qrcodeImage.value = mockQrcode
      qrcodeVisible.value = true
    }
  }
}

const handleViewQrcode = async (row) => {
  try {
    const res = await productApi.getQrcode(row.id)
    qrcodeImage.value = res?.qrcodeUrl || res?.data?.qrcodeUrl || mockQrcode
    qrcodeVisible.value = true
  } catch (error) {
    console.error(error)
    qrcodeImage.value = mockQrcode
    qrcodeVisible.value = true
  }
}

const downloadQrcode = () => {
  if (qrcodeImage.value) {
    downloadFile(qrcodeImage.value, `product-qrcode-${Date.now()}.png`)
  }
}

const mockProductData = [
  {
    id: 1,
    productNo: 'P2024060100001',
    name: '云南文山三七',
    batchNo: 'B202406010001',
    specification: '20头/500g',
    packagingType: '纸盒',
    netWeight: 0.5,
    productionDate: '2024-06-01',
    shelfLife: 24,
    totalQuantity: 1000,
    availableQuantity: 850,
    status: 2,
    storageCondition: '阴凉干燥处',
    remark: '优质三七'
  },
  {
    id: 2,
    productNo: 'P2024060200002',
    name: '长白山人参',
    batchNo: 'B202406020002',
    specification: '6年根',
    packagingType: '木盒',
    netWeight: 0.3,
    productionDate: '2024-06-02',
    shelfLife: 36,
    totalQuantity: 500,
    availableQuantity: 500,
    status: 1,
    storageCondition: '冷藏保存',
    remark: '特级人参'
  },
  {
    id: 3,
    productNo: 'P2024060300003',
    name: '宁夏枸杞',
    batchNo: 'B202406030003',
    specification: '特级',
    packagingType: '袋装',
    netWeight: 0.25,
    productionDate: '2024-06-03',
    shelfLife: 18,
    totalQuantity: 2000,
    availableQuantity: 1200,
    status: 2,
    storageCondition: '密封保存',
    remark: '中宁枸杞'
  },
  {
    id: 4,
    productNo: 'P2024060400004',
    name: '安徽亳州白芍',
    batchNo: 'B202406040004',
    specification: '一级',
    packagingType: '纸箱',
    netWeight: 1,
    productionDate: '2024-06-04',
    shelfLife: 24,
    totalQuantity: 800,
    availableQuantity: 0,
    status: 3,
    storageCondition: '通风干燥',
    remark: '道地药材'
  },
  {
    id: 5,
    productNo: 'P2024060500005',
    name: '四川川芎',
    batchNo: 'B202406050005',
    specification: '统货',
    packagingType: '编织袋',
    netWeight: 5,
    productionDate: '2024-06-05',
    shelfLife: 24,
    totalQuantity: 300,
    availableQuantity: 280,
    status: 0,
    storageCondition: '阴凉干燥',
    remark: '待加工'
  }
]

const mockBatchData = [
  { id: 1, batchNo: 'B202406010001', name: '2024年第一批三七' },
  { id: 2, batchNo: 'B202406020002', name: '2024年第一批人参' },
  { id: 3, batchNo: 'B202406030003', name: '2024年第一批枸杞' },
  { id: 4, batchNo: 'B202406040004', name: '2024年第一批白芍' },
  { id: 5, batchNo: 'B202406050005', name: '2024年第一批川芎' }
]

const mockQrcode = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMmQ1YTI3IiBmb250LXNpemU9IjE0Ij7ku5rotoXovazmnI3ljJfml6Dku7rpgJrnmoTnqbrlj5c8L3RleHQ+PC9zdmc+'

onMounted(() => {
  fetchList()
  fetchBatchOptions()
})
</script>

<style lang="scss" scoped>
.qrcode-container {
  text-align: center;
  padding: 20px;
  
  img {
    width: 200px;
    height: 200px;
    margin-bottom: 16px;
  }
  
  .qrcode-tip {
    color: #666;
    font-size: 14px;
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .el-icon {
    color: var(--primary-green);
  }
}
</style>
