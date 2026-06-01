<template>
  <div class="verify-page">
    <div class="header">
      <h1 class="title">司法鉴定意见书验真系统</h1>
    </div>

    <div class="container">
      <div class="verify-card">
        <h2 class="card-title">请输入验真码或扫码验真</h2>

        <el-form :model="form" class="verify-form" @submit.prevent>
          <el-form-item>
            <el-input
              v-model="form.verifyCode"
              placeholder="请输入验真码"
              size="large"
              clearable
              @keyup.enter="handleVerify"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="verify-btn"
              :loading="loading"
              @click="handleVerify"
            >
              立即验真
            </el-button>
          </el-form-item>
        </el-form>

        <div class="divider">
          <span>或</span>
        </div>

        <div class="scan-tip">
          <el-icon class="scan-icon"><QRCode /></el-icon>
          <p>使用手机扫描意见书上的二维码可直接验真</p>
        </div>
      </div>

      <div v-if="resultStatus !== 'idle'" class="result-card">
        <div v-if="resultStatus === 'success'" class="result-success">
          <div class="result-icon success">
            <el-icon :size="48"><CircleCheck /></el-icon>
          </div>
          <h3 class="result-title success-title">验真通过</h3>
          <el-descriptions :column="1" border class="info-table">
            <el-descriptions-item label="意见书编号">
              {{ opinionData.opinionNo }}
            </el-descriptions-item>
            <el-descriptions-item label="标题">
              {{ opinionData.title }}
            </el-descriptions-item>
            <el-descriptions-item label="鉴定类型">
              {{ opinionData.appraisalType }}
            </el-descriptions-item>
            <el-descriptions-item label="委托单位">
              {{ opinionData.entrustUnit }}
            </el-descriptions-item>
            <el-descriptions-item label="鉴定人">
              {{ opinionData.appraisers }}
            </el-descriptions-item>
            <el-descriptions-item label="出具日期">
              {{ opinionData.issueDate }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag type="success">已出具</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          <div v-if="opinionData.qrCodeUrl" class="qrcode-section">
            <p class="qrcode-label">验真二维码</p>
            <img :src="opinionData.qrCodeUrl" alt="验真二维码" class="qrcode-img" />
          </div>
        </div>

        <div v-else-if="resultStatus === 'error'" class="result-error">
          <div class="result-icon error">
            <el-icon :size="48"><CircleCloseFilled /></el-icon>
          </div>
          <h3 class="result-title error-title">验真失败</h3>
          <p class="error-message">该验真码不存在或意见书未正式出具</p>
        </div>

        <div v-else-if="resultStatus === 'rateLimit'" class="result-rate-limit">
          <div class="result-icon warning">
            <el-icon :size="48"><Warning /></el-icon>
          </div>
          <h3 class="result-title warning-title">请求过于频繁</h3>
          <p class="warning-message">请稍后再试</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, QrCode, CircleCheckFilled, CircleCloseFilled, WarningFilled } from '@element-plus/icons-vue'
import { verifyOpinionByCode } from '@/api/verify'

const route = useRoute()
const loading = ref(false)
const resultStatus = ref('idle')

const form = reactive({
  verifyCode: ''
})

const opinionData = reactive({
  opinionNo: '',
  title: '',
  appraisalType: '',
  entrustUnit: '',
  appraisers: '',
  issueDate: '',
  qrCodeUrl: ''
})

const handleVerify = async () => {
  if (!form.verifyCode.trim()) {
    ElMessage.warning('请输入验真码')
    return
  }

  loading.value = true
  resultStatus.value = 'idle'

  try {
    const res = await verifyOpinionByCode(form.verifyCode.trim())
    if (res.code === 200 && res.data) {
      opinionData.opinionNo = res.data.opinionNo
      opinionData.title = res.data.title
      opinionData.appraisalType = res.data.appraisalType
      opinionData.entrustUnit = res.data.entrustUnit
      opinionData.appraisers = res.data.appraisers
      opinionData.issueDate = res.data.issueDate
      opinionData.qrCodeUrl = res.data.qrCodeUrl
      resultStatus.value = 'success'
    } else {
      resultStatus.value = 'error'
    }
  } catch (error) {
    if (error.response?.status === 429) {
      resultStatus.value = 'rateLimit'
    } else {
      resultStatus.value = 'error'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const code = route.query.code
  if (code) {
    form.verifyCode = code
    handleVerify()
  }
})
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  color: #fff;
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 500px;
  margin: 0 auto;
}

.verify-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.card-title {
  text-align: center;
  color: #303133;
  font-size: 20px;
  margin: 0 0 30px 0;
}

.verify-form {
  margin-bottom: 20px;
}

.verify-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 30px 0;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #e4e7ed;
}

.divider span {
  position: relative;
  background: #fff;
  padding: 0 20px;
  color: #909399;
  font-size: 14px;
}

.scan-tip {
  text-align: center;
  color: #606266;
}

.scan-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 10px;
}

.scan-tip p {
  margin: 0;
  font-size: 14px;
}

.result-card {
  margin-top: 30px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.result-icon {
  text-align: center;
  margin-bottom: 20px;
}

.result-icon.success {
  color: #67c23a;
}

.result-icon.error {
  color: #f56c6c;
}

.result-icon.warning {
  color: #e6a23c;
}

.result-title {
  text-align: center;
  font-size: 24px;
  margin: 0 0 20px 0;
}

.success-title {
  color: #67c23a;
}

.error-title {
  color: #f56c6c;
}

.warning-title {
  color: #e6a23c;
}

.error-message,
.warning-message {
  text-align: center;
  color: #606266;
  font-size: 16px;
  margin: 0;
}

.info-table {
  margin-top: 20px;
}

.qrcode-section {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.qrcode-label {
  color: #606266;
  font-size: 14px;
  margin-bottom: 15px;
}

.qrcode-img {
  width: 150px;
  height: 150px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
}
</style>
