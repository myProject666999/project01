<template>
  <div class="review-list">
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>待复核列表 - {{ currentRoleText }}</span>
          <el-tag :type="getReviewLevelTag(currentReviewLevel)">
            第{{ currentReviewLevel }}级复核
          </el-tag>
        </div>
      </template>
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="opinionNo" label="意见书编号" width="200" />
        <el-table-column prop="title" label="标题" min-width="250" show-overflow-tooltip />
        <el-table-column prop="submitTime" label="提交时间" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleReview(row)">复核</el-button>
            <el-button type="info" link @click="handleViewHistory(row)">历史</el-button>
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
      v-model="reviewDialogVisible"
      title="复核意见书"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border class="opinion-detail">
        <el-descriptions-item label="意见书编号">{{ currentOpinion.opinionNo }}</el-descriptions-item>
        <el-descriptions-item label="委托编号">{{ currentOpinion.entrustNo }}</el-descriptions-item>
        <el-descriptions-item label="标题" :span="2">{{ currentOpinion.title }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOpinion.status)">{{ getStatusText(currentOpinion.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="版本">v{{ currentOpinion.version || '1.0' }}</el-descriptions-item>
        <el-descriptions-item label="第一鉴定人">{{ currentOpinion.firstAppraiser || '-' }}</el-descriptions-item>
        <el-descriptions-item label="第二鉴定人">{{ currentOpinion.secondAppraiser || '-' }}</el-descriptions-item>
        <el-descriptions-item label="鉴定结论" :span="2">
          <div style="white-space: pre-wrap;">{{ currentOpinion.conclusion || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">复核信息</el-divider>

      <el-form :model="reviewForm" :rules="reviewRules" ref="reviewFormRef" label-width="120px">
        <el-form-item label="复核结果" prop="result">
          <el-radio-group v-model="reviewForm.result">
            <el-radio value="PASS">
              <span style="color: #67C23A;">PASS - 通过</span>
            </el-radio>
            <el-radio value="REJECT">
              <span style="color: #F56C6C;">REJECT - 驳回</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="打回到" prop="rejectLevel" v-if="reviewForm.result === 'REJECT'">
          <el-select v-model="reviewForm.rejectLevel" placeholder="请选择退回级别" style="width: 100%">
            <el-option label="0 - 退回撰写人" :value="0" />
            <el-option label="1 - 退回一级复核" :value="1" v-if="currentReviewLevel > 1" />
            <el-option label="2 - 退回二级复核" :value="2" v-if="currentReviewLevel > 2" />
          </el-select>
        </el-form-item>
        <el-form-item label="复核意见" prop="comment">
          <el-input
            v-model="reviewForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入复核意见"
          />
        </el-form-item>
        <el-form-item label="复核人签名" prop="signature">
          <el-input
            v-model="reviewForm.signature"
            type="textarea"
            :rows="3"
            placeholder="请输入复核人签名"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleReviewSubmit">提交复核</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="historyDialogVisible" title="复核历史" width="700px">
      <div class="history-timeline">
        <el-timeline v-if="historyData.length > 0">
          <el-timeline-item
            v-for="(item, index) in historyData"
            :key="item.id"
            :timestamp="item.reviewTime"
            :type="getTimelineType(item.result)"
            placement="top"
          >
            <el-card class="history-item-card" shadow="hover">
              <div class="history-header">
                <el-tag :type="getResultTagType(item.result)" size="large">
                  {{ getResultText(item.result) }}
                </el-tag>
                <span class="reviewer">{{ item.reviewerName || '复核人' }}</span>
              </div>
              <div class="history-content">
                <div class="info-row" v-if="item.rejectLevel !== null && item.rejectLevel !== undefined">
                  <span class="label">退回级别：</span>
                  <span class="value">{{ getRejectLevelText(item.rejectLevel) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">复核意见：</span>
                  <span class="value">{{ item.comment || '-' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">复核级别：</span>
                  <span class="value">第{{ item.reviewLevel }}级</span>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无复核历史" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMyReviews, approveReview, rejectReview, getReviewHistory } from '@/api/review'
import { getOpinion } from '@/api/opinion'

const loading = ref(false)
const submitLoading = ref(false)
const reviewDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const currentOpinion = ref({})
const reviewFormRef = ref(null)
const historyData = ref([])
const currentReviewLevel = ref(1)
const currentRoleText = computed(() => {
  const map = {
    1: '一级复核员',
    2: '二级复核员',
    3: '三级复核员'
  }
  return map[currentReviewLevel.value] || '复核员'
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const reviewForm = reactive({
  opinionId: null,
  result: 'PASS',
  rejectLevel: 0,
  comment: '',
  signature: ''
})

const reviewRules = {
  result: [{ required: true, message: '请选择复核结果', trigger: 'change' }],
  rejectLevel: [{ required: true, message: '请选择退回级别', trigger: 'change' }],
  comment: [{ required: true, message: '请输入复核意见', trigger: 'blur' }],
  signature: [{ required: true, message: '请输入复核人签名', trigger: 'blur' }]
}

const statusMap = {
  REVIEW1: { text: '一级复核', type: 'primary' },
  REVIEW2: { text: '二级复核', type: 'primary' },
  REVIEW3: { text: '三级复核', type: 'primary' }
}

const getStatusText = (status) => statusMap[status]?.text || status
const getStatusType = (status) => statusMap[status]?.type || 'info'

const getReviewLevelTag = (level) => {
  const map = { 1: 'primary', 2: 'warning', 3: 'danger' }
  return map[level] || 'info'
}

const getResultText = (result) => {
  const map = { PASS: '通过', REJECT: '驳回' }
  return map[result] || result
}

const getResultTagType = (result) => {
  const map = { PASS: 'success', REJECT: 'danger' }
  return map[result] || 'info'
}

const getTimelineType = (result) => {
  const map = { PASS: 'success', REJECT: 'danger' }
  return map[result] || 'info'
}

const getRejectLevelText = (level) => {
  const map = {
    0: '退回撰写人',
    1: '退回一级复核',
    2: '退回二级复核'
  }
  return map[level] || `退回第${level}级复核`
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      reviewLevel: currentReviewLevel.value
    }
    const res = await getMyReviews(params)
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

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  fetchList()
}

const handleCurrentChange = (page) => {
  pagination.pageNum = page
  fetchList()
}

const resetReviewForm = () => {
  reviewForm.opinionId = null
  reviewForm.result = 'PASS'
  reviewForm.rejectLevel = 0
  reviewForm.comment = ''
  reviewForm.signature = ''
  if (reviewFormRef.value) {
    reviewFormRef.value.resetFields()
  }
}

const handleReview = async (row) => {
  resetReviewForm()
  reviewForm.opinionId = row.id
  try {
    const res = await getOpinion(row.id)
    if (res.code === 200) {
      currentOpinion.value = res.data || {}
    } else {
      currentOpinion.value = row
    }
    reviewDialogVisible.value = true
  } catch (error) {
    currentOpinion.value = row
    reviewDialogVisible.value = true
  }
}

const handleReviewSubmit = async () => {
  if (!reviewFormRef.value) return
  try {
    await reviewFormRef.value.validate()
    submitLoading.value = true
    
    let res
    if (reviewForm.result === 'PASS') {
      res = await approveReview(reviewForm.opinionId, {
        comment: reviewForm.comment,
        signature: reviewForm.signature
      })
    } else {
      res = await rejectReview(reviewForm.opinionId, {
        comment: reviewForm.comment,
        signature: reviewForm.signature,
        rejectLevel: reviewForm.rejectLevel
      })
    }
    
    if (res.code === 200) {
      ElMessage.success('复核提交成功')
      reviewDialogVisible.value = false
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

const handleViewHistory = async (row) => {
  historyData.value = []
  try {
    const res = await getReviewHistory(row.id)
    if (res.code === 200) {
      historyData.value = res.data || []
    }
    historyDialogVisible.value = true
  } catch (error) {
    historyDialogVisible.value = true
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.review-list {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.opinion-detail {
  margin-bottom: 20px;
}

.history-timeline {
  max-height: 500px;
  overflow-y: auto;
}

.history-item-card {
  margin-bottom: 10px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer {
  font-size: 14px;
  color: #606266;
}

.history-content .info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: 14px;
}

.history-content .label {
  color: #606266;
  min-width: 100px;
  flex-shrink: 0;
}

.history-content .value {
  color: #303133;
  flex: 1;
}
</style>
