<template>
  <div class="opinion-list">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 180px"
          >
            <el-option label="草稿" value="DRAFT" />
            <el-option label="一级复核" value="REVIEW1" />
            <el-option label="二级复核" value="REVIEW2" />
            <el-option label="三级复核" value="REVIEW3" />
            <el-option label="已驳回" value="REJECTED" />
            <el-option label="已签发" value="ISSUED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="opinionNo" label="意见书编号" width="200" />
        <el-table-column prop="entrustNo" label="委托" width="180" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reviewLevel" label="当前复核级别" width="140">
          <template #default="{ row }">
            {{ getReviewLevelText(row.reviewLevel) }}
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="100">
          <template #default="{ row }">
            v{{ row.version || '1.0' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建日期" width="180" />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button 
              type="warning" 
              link 
              @click="handleEdit(row)"
              :disabled="row.status === 'ISSUED'"
            >编辑</el-button>
            <el-button 
              type="success" 
              link 
              @click="handleSubmitReview(row)"
              :disabled="row.status !== 'DRAFT' && row.status !== 'REJECTED'"
            >提交复核</el-button>
            <el-button 
              type="info" 
              link 
              @click="handleDownloadQr(row)"
              :disabled="row.status !== 'ISSUED'"
            >下载二维码</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog
      v-model="submitReviewDialogVisible"
      title="提交复核"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-alert
        title="提交复核需要第一鉴定人签名确认"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-form :model="submitReviewForm" :rules="submitReviewRules" ref="submitReviewFormRef" label-width="100px">
        <el-form-item label="意见书编号">
          <el-input v-model="submitReviewForm.opinionNo" disabled />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="submitReviewForm.title" disabled />
        </el-form-item>
        <el-form-item label="鉴定人签名" prop="signature">
          <el-input
            v-model="submitReviewForm.signature"
            type="textarea"
            :rows="3"
            placeholder="请输入鉴定人签名确认"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="submitReviewDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitReviewConfirm">确认提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewVisible" title="意见书详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="意见书编号">{{ currentRow.opinionNo }}</el-descriptions-item>
        <el-descriptions-item label="委托编号">{{ currentRow.entrustNo }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ currentRow.title }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRow.status)">{{ getStatusText(currentRow.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前复核级别">{{ getReviewLevelText(currentRow.reviewLevel) }}</el-descriptions-item>
        <el-descriptions-item label="版本">v{{ currentRow.version || '1.0' }}</el-descriptions-item>
        <el-descriptions-item label="创建日期">{{ currentRow.createTime }}</el-descriptions-item>
        <el-descriptions-item label="第一鉴定人">{{ currentRow.firstAppraiser || '-' }}</el-descriptions-item>
        <el-descriptions-item label="第二鉴定人">{{ currentRow.secondAppraiser || '-' }}</el-descriptions-item>
        <el-descriptions-item label="意见书摘要" :span="2">
          <div style="white-space: pre-wrap;">{{ currentRow.summary || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="鉴定结论" :span="2">
          <div style="white-space: pre-wrap;">{{ currentRow.conclusion || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getOpinionList, submitOpinion, generateQrCode } from '@/api/opinion'

const loading = ref(false)
const submitLoading = ref(false)
const submitReviewDialogVisible = ref(false)
const viewVisible = ref(false)
const currentRow = ref({})
const submitReviewFormRef = ref(null)

const searchForm = reactive({
  status: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const submitReviewForm = reactive({
  id: null,
  opinionNo: '',
  title: '',
  signature: ''
})

const submitReviewRules = {
  signature: [{ required: true, message: '请输入鉴定人签名确认', trigger: 'blur' }]
}

const statusMap = {
  DRAFT: { text: '草稿', type: 'info' },
  REVIEW1: { text: '一级复核', type: 'primary' },
  REVIEW2: { text: '二级复核', type: 'primary' },
  REVIEW3: { text: '三级复核', type: 'primary' },
  REJECTED: { text: '已驳回', type: 'danger' },
  ISSUED: { text: '已签发', type: 'success' }
}

const getStatusText = (status) => statusMap[status]?.text || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

const getReviewLevelText = (level) => {
  const map = {
    0: '待复核',
    1: '一级复核',
    2: '二级复核',
    3: '三级复核'
  }
  return map[level] || '-'
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    const res = await getOpinionList(params)
    if (res.code === 200) {
      tableData.value = res.data?.list || []
      pagination.total = res.data?.total || 0
    }
  } catch (error) {
    console.error('获取列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchList()
}

const handleReset = () => {
  searchForm.status = ''
  handleSearch()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  fetchList()
}

const handleCurrentChange = (page) => {
  pagination.pageNum = page
  fetchList()
}

const handleView = (row) => {
  currentRow.value = row
  viewVisible.value = true
}

const handleEdit = (row) => {
  ElMessage.info('编辑功能待实现')
}

const handleSubmitReview = (row) => {
  submitReviewForm.id = row.id
  submitReviewForm.opinionNo = row.opinionNo
  submitReviewForm.title = row.title
  submitReviewForm.signature = ''
  if (submitReviewFormRef.value) {
    submitReviewFormRef.value.resetFields()
  }
  submitReviewDialogVisible.value = true
}

const handleSubmitReviewConfirm = async () => {
  if (!submitReviewFormRef.value) return
  try {
    await submitReviewFormRef.value.validate()
    submitLoading.value = true
    const res = await submitOpinion(submitReviewForm.id)
    if (res.code === 200) {
      ElMessage.success('提交复核成功')
      submitReviewDialogVisible.value = false
      fetchList()
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

const handleDownloadQr = async (row) => {
  try {
    const res = await generateQrCode(row.id)
    if (res.code === 200) {
      const link = document.createElement('a')
      link.href = res.data
      link.download = `qrcode_${row.opinionNo}.png`
      link.click()
      ElMessage.success('二维码下载成功')
    }
  } catch (error) {
    console.error('下载二维码失败', error)
    ElMessage.error('下载二维码失败')
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.opinion-list {
  padding: 0;
}

.search-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
