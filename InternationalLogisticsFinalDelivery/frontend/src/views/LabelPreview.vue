<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">面单预览</h1>
      <div>
        <el-select v-model="selectedLang" @change="loadLabel" style="margin-right: 10px; width: 150px;">
          <el-option label="英语" value="en" />
          <el-option label="西班牙语" value="es" />
          <el-option label="阿拉伯语" value="ar" />
          <el-option label="法语" value="fr" />
          <el-option label="德语" value="de" />
        </el-select>
        <el-button @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <div class="label-preview" v-loading="loading" v-if="labelData">
      <div class="label-header">
        <div class="label-title">INTERNATIONAL SHIPPING LABEL</div>
        <div class="label-subtitle">{{ getLanguageText(selectedLang) }}</div>
      </div>

      <div class="label-barcode">
        <img :src="barcodeUrl" alt="Barcode" />
        <div class="barcode-text">{{ labelData.barcode }}</div>
      </div>

      <div class="label-content">
        <div class="label-row">
          <span class="label-key">{{ labelData.labels.tracking_number }}:</span>
          <span class="label-value">{{ labelData.package_no }}</span>
        </div>
        <div class="label-row">
          <span class="label-key">{{ labelData.labels.recipient }}:</span>
          <span class="label-value">{{ labelData.customer_name }}</span>
        </div>
        <div class="label-row">
          <span class="label-key">{{ labelData.labels.phone }}:</span>
          <span class="label-value">{{ labelData.customer_phone }}</span>
        </div>
        <div class="label-row">
          <span class="label-key">{{ labelData.labels.address }}:</span>
          <span class="label-value">
            {{ labelData.address }}, {{ labelData.city }}, {{ labelData.country }} {{ labelData.zip_code }}
          </span>
        </div>
        <div class="label-row">
          <span class="label-key">{{ labelData.labels.weight }}:</span>
          <span class="label-value">{{ labelData.weight }} kg</span>
        </div>
        <div class="label-row">
          <span class="label-key">{{ labelData.labels.warehouse }}:</span>
          <span class="label-value">{{ labelData.warehouse_name }} ({{ labelData.warehouse_code }})</span>
        </div>
        <div class="label-row" v-if="labelData.goods">
          <span class="label-key">Goods:</span>
          <span class="label-value">{{ labelData.goods }}</span>
        </div>
      </div>

      <div class="label-qrcode">
        <img :src="qrcodeUrl" alt="QR Code" />
        <div class="qrcode-text">{{ labelData.labels.scan_to_track }}</div>
      </div>

      <div class="label-footer">
        <el-tag type="warning" size="large" v-if="selectedLang === 'ar'">قابل للكسر</el-tag>
        <el-tag type="warning" size="large" v-else-if="selectedLang === 'es'">FRÁGIL</el-tag>
        <el-tag type="warning" size="large" v-else-if="selectedLang === 'fr'">FRAGILE</el-tag>
        <el-tag type="warning" size="large" v-else-if="selectedLang === 'de'">ZERBRECHLICH</el-tag>
        <el-tag type="warning" size="large" v-else>FRAGILE</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { labelAPI } from '../api'

const route = useRoute()
const packageId = route.params.id
const loading = ref(false)
const labelData = ref(null)
const selectedLang = ref('en')
const packageNo = ref('')

const barcodeUrl = computed(() => {
  return labelAPI.getBarcode(packageId) + '?t=' + Date.now()
})

const qrcodeUrl = computed(() => {
  return labelAPI.getQRCode(packageNo.value) + '?t=' + Date.now()
})

const getLanguageText = (lang) => {
  const texts = { 'en': 'English', 'es': 'Español', 'ar': 'العربية', 'fr': 'Français', 'de': 'Deutsch' }
  return texts[lang] || lang
}

const loadLabel = async () => {
  loading.value = true
  try {
    const res = await labelAPI.generate(packageId, selectedLang.value)
    labelData.value = res.data
    packageNo.value = res.data.package_no
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLabel()
})
</script>

<style scoped>
.label-preview {
  border: 2px solid #303133;
  border-radius: 12px;
  padding: 30px;
  background: #fff;
  max-width: 700px;
  margin: 0 auto;
}

.label-header {
  text-align: center;
  border-bottom: 2px dashed #dcdfe6;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.label-title {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
  letter-spacing: 2px;
}

.label-subtitle {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.label-barcode {
  text-align: center;
  margin: 20px 0;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.label-barcode img {
  max-width: 100%;
  height: 100px;
}

.barcode-text {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 3px;
  margin-top: 10px;
  color: #303133;
}

.label-content {
  display: grid;
  gap: 12px;
  margin: 20px 0;
}

.label-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.label-key {
  font-weight: 700;
  color: #606266;
  min-width: 130px;
  flex-shrink: 0;
}

.label-value {
  color: #303133;
  flex: 1;
  word-break: break-all;
  font-size: 15px;
}

.label-qrcode {
  text-align: center;
  margin: 25px 0;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.label-qrcode img {
  width: 150px;
  height: 150px;
}

.qrcode-text {
  font-size: 13px;
  color: #909399;
  margin-top: 10px;
}

.label-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 2px dashed #dcdfe6;
}
</style>
