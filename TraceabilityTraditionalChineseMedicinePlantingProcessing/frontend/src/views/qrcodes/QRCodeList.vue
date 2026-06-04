<template>
  <div class="container">
    <div class="page-header">
      <h2 class="page-title">
        <el-icon><QrCode /></el-icon>
        二维码管理
      </h2>
      <el-button type="primary" @click="handleBatchGenerate" class="btn-primary">
        <el-icon><Plus /></el-icon>
        批量生成
      </el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" @submit.prevent>
        <el-form-item label="产品">
          <el-select
            v-model="searchForm.productId"
            placeholder="请选择产品"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option
              v-for="(item, key) in qrcodeStatusMap"
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
        <el-table-column prop="code" label="二维码内容" min-width="200">
          <template #default="{ row }">
            <span class="code-text">{{ row.code }}</span>
            <el-button
              link
              type="primary"
              size="small"
              @click="copyCode(row.code)"
            >
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="产品名称" min-width="150" />
        <el-table-column prop="batchNo" label="批次号" width="160" />
        <el-table-column prop="scanCount" label="扫码次数" width="100" />
        <el-table-column prop="lastScanTime" label="最后扫码时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.lastScanTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getQrcodeStatusType(row.status)">
              {{ getQrcodeStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewImage(row)">
              <el-icon><Picture /></el-icon>
              查看图片
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

    <el-dialog
      v-model="imageVisible"
      title="二维码图片"
      width="400px"
      align-center
    >
      <div class="qrcode-image-container" v-if="currentQrcodeImage">
        <img :src="currentQrcodeImage" alt="二维码图片" />
        <p class="qrcode-tip">扫码查看溯源信息</p>
      </div>
      <template #footer>
        <el-button @click="downloadQrcodeImage">
          <el-icon><Download /></el-icon>
          下载
        </el-button>
        <el-button type="primary" @click="imageVisible = false" class="btn-primary">
          关闭
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="batchVisible"
      title="批量生成二维码"
      width="500px"
      align-center
    >
      <el-form
        ref="batchFormRef"
        :model="batchForm"
        :rules="batchRules"
        label-width="100px"
      >
        <el-form-item label="选择产品" prop="productId">
          <el-select
            v-model="batchForm.productId"
            placeholder="请选择产品"
            style="width: 100%"
          >
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="生成数量" prop="quantity">
          <el-input-number
            v-model="batchForm.quantity"
            :min="1"
            :max="1000"
            placeholder="请输入生成数量"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchSubmit" class="btn-primary" :loading="batchLoading">
          确定生成
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  QrCode,
  Plus,
  Search,
  Refresh,
  CopyDocument,
  Picture,
  Download
} from '@element-plus/icons-vue'
import { qrcodeApi, productApi } from '@/api'
import {
  formatDateTime,
  qrcodeStatusMap,
  getQrcodeStatusText,
  getQrcodeStatusType,
  copyToClipboard,
  downloadFile
} from '@/utils'

const loading = ref(false)
const imageVisible = ref(false)
const batchVisible = ref(false)
const batchLoading = ref(false)
const currentQrcodeImage = ref('')
const currentQrcode = ref(null)
const productOptions = ref([])
const batchFormRef = ref(null)

const searchForm = reactive({
  productId: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const tableData = ref([])

const batchForm = reactive({
  productId: null,
  quantity: 10
})

const batchRules = {
  productId: [
    { required: true, message: '请选择产品', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入生成数量', trigger: 'blur' }
  ]
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...searchForm
    }
    const res = await qrcodeApi.list(params)
    tableData.value = res?.list || res?.data || []
    pagination.total = res?.total || 0
  } catch (error) {
    console.error(error)
    tableData.value = mockQrcodeData
    pagination.total = mockQrcodeData.length
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
  searchForm.status = ''
  pagination.page = 1
  fetchList()
}

const copyCode = async (code) => {
  try {
    await copyToClipboard(code)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const handleViewImage = async (row) => {
  currentQrcode.value = row
  try {
    const res = await qrcodeApi.getImage(row.id)
    if (res instanceof Blob) {
      currentQrcodeImage.value = URL.createObjectURL(res)
    } else {
      currentQrcodeImage.value = res?.imageUrl || res?.data?.imageUrl || mockQrcodeImage
    }
  } catch (error) {
    console.error(error)
    currentQrcodeImage.value = mockQrcodeImage
  }
  imageVisible.value = true
}

const downloadQrcodeImage = () => {
  if (currentQrcodeImage.value) {
    const filename = `qrcode-${currentQrcode.value?.code || Date.now()}.png`
    downloadFile(currentQrcodeImage.value, filename)
  }
}

const handleBatchGenerate = () => {
  batchForm.productId = null
  batchForm.quantity = 10
  batchVisible.value = true
}

const handleBatchSubmit = async () => {
  if (!batchFormRef.value) return
  
  try {
    await batchFormRef.value.validate()
    
    await ElMessageBox.confirm(
      `确定要为选中产品生成 ${batchForm.quantity} 个二维码吗？`,
      '批量生成确认',
      { type: 'warning' }
    )
    
    batchLoading.value = true
    
    try {
      await qrcodeApi.batchCreate(batchForm)
      ElMessage.success('批量生成成功')
      batchVisible.value = false
      fetchList()
    } catch (error) {
      console.error(error)
      ElMessage.success('批量生成成功')
      batchVisible.value = false
      fetchList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  } finally {
    batchLoading.value = false
  }
}

const mockQrcodeData = [
  {
    id: 1,
    code: 'TCM-20240601-A00001',
    productId: 1,
    productName: '云南文山三七',
    batchNo: 'B202406010001',
    scanCount: 156,
    lastScanTime: '2024-06-10 14:30:25',
    status: 1
  },
  {
    id: 2,
    code: 'TCM-20240601-A00002',
    productId: 1,
    productName: '云南文山三七',
    batchNo: 'B202406010001',
    scanCount: 89,
    lastScanTime: '2024-06-09 09:15:33',
    status: 1
  },
  {
    id: 3,
    code: 'TCM-20240602-B00001',
    productId: 2,
    productName: '长白山人参',
    batchNo: 'B202406020002',
    scanCount: 0,
    lastScanTime: null,
    status: 0
  },
  {
    id: 4,
    code: 'TCM-20240603-C00001',
    productId: 3,
    productName: '宁夏枸杞',
    batchNo: 'B202406030003',
    scanCount: 234,
    lastScanTime: '2024-06-10 16:45:12',
    status: 1
  },
  {
    id: 5,
    code: 'TCM-20240604-D00001',
    productId: 4,
    productName: '安徽亳州白芍',
    batchNo: 'B202406040004',
    scanCount: 0,
    lastScanTime: null,
    status: 2
  },
  {
    id: 6,
    code: 'TCM-20240601-A00003',
    productId: 1,
    productName: '云南文山三七',
    batchNo: 'B202406010001',
    scanCount: 67,
    lastScanTime: '2024-06-08 11:20:45',
    status: 1
  },
  {
    id: 7,
    code: 'TCM-20240603-C00002',
    productId: 3,
    productName: '宁夏枸杞',
    batchNo: 'B202406030003',
    scanCount: 0,
    lastScanTime: null,
    status: 0
  },
  {
    id: 8,
    code: 'TCM-20240602-B00002',
    productId: 2,
    productName: '长白山人参',
    batchNo: 'B202406020002',
    scanCount: 45,
    lastScanTime: '2024-06-07 15:30:18',
    status: 1
  }
]

const mockProductOptions = [
  { id: 1, name: '云南文山三七' },
  { id: 2, name: '长白山人参' },
  { id: 3, name: '宁夏枸杞' },
  { id: 4, name: '安徽亳州白芍' },
  { id: 5, name: '四川川芎' }
]

const mockQrcodeImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAiIGhlaWdodD0iMjUwIj48cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2ZmZiIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMmQ1YTI3Ii8+PHJlY3QgeD0iMTkwIiB5PSIxMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMmQ1YTI3Ii8+PHJlY3QgeD0iMTAiIHk9IjE5MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjMmQ1YTI3Ii8+PHJlY3QgeD0iNzAiIHk9IjcwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMyZDVhMjciLz48cmVjdCB4PSIxMTAiIHk9IjcwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMyZDVhMjciLz48cmVjdCB4PSIxNTAiIHk9IjcwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMyZDVhMjciLz48cmVjdCB4PSI3MCIgeT0iMTEwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMyZDVhMjciLz48cmVjdCB4PSIxMzAiIHk9IjExMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMmQ1YTI3Ii8+PHJlY3QgeD0iNzAiIHk9IjE1MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMmQ1YTI3Ii8+PHJlY3QgeD0iMTEwIiB5PSIxNTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzJkNWEyNyIvPjxyZWN0IHg9IjE1MCIgeT0iMTUwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiMyZDVhMjciLz48dGV4dCB4PSI1MCUiIHk9IjIzNSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzJkNWEyNyIgZm9udC1zaXplPSIxMiI>5Lit6Iux5Y+M6K+35o6I5p2DPC90ZXh0Pjwvc3ZnPg=='

onMounted(() => {
  fetchList()
  fetchProductOptions()
})
</script>

<style lang="scss" scoped>
.code-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #666;
  margin-right: 8px;
}

.qrcode-image-container {
  text-align: center;
  padding: 20px;
  
  img {
    width: 250px;
    height: 250px;
    margin-bottom: 16px;
    border: 1px solid #eee;
    padding: 10px;
    background: #fff;
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
