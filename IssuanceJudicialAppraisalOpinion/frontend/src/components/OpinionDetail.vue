<template>
  <div class="opinion-detail">
    <div class="detail-header">
      <h2 class="detail-title">{{ opinion.title }}</h2>
      <el-tag :type="statusType" size="large">{{ statusText }}</el-tag>
    </div>

    <el-descriptions :column="2" border class="info-section">
      <el-descriptions-item label="意见书编号">
        {{ opinion.opinionNo }}
      </el-descriptions-item>
      <el-descriptions-item label="鉴定类型">
        {{ opinion.appraisalType }}
      </el-descriptions-item>
      <el-descriptions-item label="委托单位">
        {{ opinion.entrustUnit }}
      </el-descriptions-item>
      <el-descriptions-item label="委托编号">
        {{ opinion.entrustNo }}
      </el-descriptions-item>
      <el-descriptions-item label="出具日期">
        {{ opinion.issueDate }}
      </el-descriptions-item>
      <el-descriptions-item label="有效期至">
        {{ opinion.validUntil }}
      </el-descriptions-item>
      <el-descriptions-item label="鉴定材料">
        {{ opinion.material }}
      </el-descriptions-item>
      <el-descriptions-item label="鉴定要求">
        {{ opinion.requirement }}
      </el-descriptions-item>
      <el-descriptions-item label="鉴定过程" :span="2">
        {{ opinion.process }}
      </el-descriptions-item>
      <el-descriptions-item label="分析说明" :span="2">
        {{ opinion.analysis }}
      </el-descriptions-item>
      <el-descriptions-item label="鉴定意见" :span="2">
        <span class="conclusion-text">{{ opinion.conclusion }}</span>
      </el-descriptions-item>
    </el-descriptions>

    <div class="signature-section">
      <h3 class="section-title">签名信息</h3>
      <div class="signature-row">
        <div class="signature-item">
          <p class="signature-label">鉴定人签名</p>
          <div v-if="opinion.appraiserSignUrl" class="signature-img-box">
            <img :src="opinion.appraiserSignUrl" alt="鉴定人签名" class="signature-img" />
          </div>
          <div v-else class="signature-placeholder">暂无签名</div>
          <p class="signatory-name">{{ opinion.appraisers }}</p>
        </div>
        <div class="signature-item">
          <p class="signature-label">复核人签名</p>
          <div v-if="opinion.reviewerSignUrl" class="signature-img-box">
            <img :src="opinion.reviewerSignUrl" alt="复核人签名" class="signature-img" />
          </div>
          <div v-else class="signature-placeholder">暂无签名</div>
          <p class="signatory-name">{{ opinion.reviewer }}</p>
        </div>
      </div>
    </div>

    <div class="qrcode-section">
      <h3 class="section-title">验真二维码</h3>
      <div class="qrcode-content">
        <div v-if="qrCodeValue" class="qrcode-box">
          <QRCodeVue :value="qrCodeValue" :size="150" />
          <p class="qrcode-tip">扫码验证本意见书真伪</p>
        </div>
        <div v-else-if="opinion.qrCodeUrl" class="qrcode-box">
          <img :src="opinion.qrCodeUrl" alt="验真二维码" class="qrcode-img" />
          <p class="qrcode-tip">扫码验证本意见书真伪</p>
        </div>
      </div>
    </div>

    <div v-if="reviewHistory && reviewHistory.length > 0" class="timeline-section">
      <h3 class="section-title">复核历史</h3>
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in sortedReviewHistory"
          :key="item.id"
          :timestamp="item.createTime"
          :type="getTimelineType(item.status)"
          :icon="getTimelineIcon(item.status)"
        >
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-status">{{ getStatusText(item.status) }}</span>
              <span v-if="item.reviewerName" class="timeline-reviewer">复核人：{{ item.reviewerName }}</span>
            </div>
            <p v-if="item.comment" class="timeline-comment">{{ item.comment }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import QRCodeVue from 'qrcode.vue'
import { Check, Edit, Close } from '@element-plus/icons-vue'

const props = defineProps({
  opinion: {
    type: Object,
    default: () => ({})
  },
  reviewHistory: {
    type: Array,
    default: () => []
  },
  qrCodeValue: {
    type: String,
    default: ''
  }
})

const statusType = computed(() => {
  const statusMap = {
    'draft': 'info',
    'submitted': 'warning',
    'reviewing': 'primary',
    'issued': 'success',
    'rejected': 'danger'
  }
  return statusMap[props.opinion.status] || 'info'
})

const statusText = computed(() => {
  const statusMap = {
    'draft': '草稿',
    'submitted': '已提交',
    'reviewing': '复核中',
    'issued': '已出具',
    'rejected': '已驳回'
  }
  return statusMap[props.opinion.status] || '未知'
})

const sortedReviewHistory = computed(() => {
  return [...props.reviewHistory].sort((a, b) => {
    return new Date(b.createTime) - new Date(a.createTime)
  })
})

const getTimelineType = (status) => {
  const typeMap = {
    'submitted': 'primary',
    'accepted': 'primary',
    'approved': 'success',
    'rejected': 'danger',
    'completed': 'success'
  }
  return typeMap[status] || ''
}

const getTimelineIcon = (status) => {
  const iconMap = {
    'submitted': Edit,
    'accepted': Edit,
    'approved': Check,
    'rejected': Close,
    'completed': Check
  }
  return iconMap[status] || null
}

const getStatusText = (status) => {
  const textMap = {
    'submitted': '提交复核',
    'accepted': '接受复核',
    'approved': '复核通过',
    'rejected': '复核驳回',
    'completed': '复核完成'
  }
  return textMap[status] || status
}
</script>

<style scoped>
.opinion-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e4e7ed;
}

.detail-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.info-section {
  margin-bottom: 30px;
}

.conclusion-text {
  font-weight: 600;
  color: #409eff;
  font-size: 15px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}

.signature-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.signature-row {
  display: flex;
  gap: 40px;
  justify-content: center;
}

.signature-item {
  text-align: center;
  flex: 1;
  max-width: 200px;
}

.signature-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.signature-img-box {
  width: 150px;
  height: 80px;
  background: #fff;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
}

.signature-img {
  max-width: 140px;
  max-height: 70px;
}

.signature-placeholder {
  width: 150px;
  height: 80px;
  background: #fff;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
  color: #c0c4cc;
  font-size: 14px;
}

.signatory-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}

.qrcode-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.qrcode-content {
  display: flex;
  justify-content: center;
}

.qrcode-box {
  text-align: center;
}

.qrcode-img {
  width: 150px;
  height: 150px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
}

.qrcode-tip {
  font-size: 13px;
  color: #909399;
  margin-top: 12px;
}

.timeline-section {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.timeline-content {
  padding: 10px 0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.timeline-status {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.timeline-reviewer {
  font-size: 13px;
  color: #909399;
}

.timeline-comment {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
}
</style>
