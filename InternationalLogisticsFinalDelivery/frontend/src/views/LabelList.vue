<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">面单管理</h1>
      <div>
        <el-select v-model="filterLang" @change="loadData" placeholder="筛选语言" clearable style="margin-right: 10px; width: 150px;">
          <el-option label="英语" value="en" />
          <el-option label="西班牙语" value="es" />
          <el-option label="阿拉伯语" value="ar" />
          <el-option label="法语" value="fr" />
          <el-option label="德语" value="de" />
        </el-select>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="label_no" label="面单号" />
        <el-table-column prop="tracking_no" label="追踪号" />
        <el-table-column label="包裹号">
          <template #default="{ row }">
            {{ row.package?.package_no || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="收件人">
          <template #default="{ row }">
            {{ row.package?.customer?.name }}
          </template>
        </el-table-column>
        <el-table-column label="收件地址">
          <template #default="{ row }">
            {{ row.package?.customer?.address }}
          </template>
        </el-table-column>
        <el-table-column prop="language" label="语言">
          <template #default="{ row }">
            <el-tag size="small">{{ getLangName(row.language) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewLabel(row)">
              预览
            </el-button>
            <el-button type="success" link @click="downloadLabel(row)">
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <el-dialog v-model="showPreviewDialog" title="面单预览" width="700px">
      <div v-if="currentLabel" class="label-preview" :dir="currentLabel.language === 'ar' ? 'rtl' : 'ltr'">
        <div class="label-header">
          <h2>Final Delivery Label</h2>
          <span class="label-no">{{ currentLabel.label_no }}</span>
        </div>
        
        <div class="label-content">
          <div class="label-row">
            <span class="label-key">{{ getLabel(currentLabel.language, 'tracking_number') }}:</span>
            <span class="label-value">{{ currentLabel.tracking_no }}</span>
          </div>
          <div class="label-row">
            <span class="label-key">{{ getLabel(currentLabel.language, 'recipient') }}:</span>
            <span class="label-value">{{ currentLabel.package?.customer?.name }}</span>
          </div>
          <div class="label-row">
            <span class="label-key">{{ getLabel(currentLabel.language, 'phone') }}:</span>
            <span class="label-value">{{ currentLabel.package?.customer?.phone }}</span>
          </div>
          <div class="label-row">
            <span class="label-key">{{ getLabel(currentLabel.language, 'address') }}:</span>
            <span class="label-value">{{ currentLabel.package?.customer?.address }}</span>
          </div>
          <div class="label-row">
            <span class="label-key">{{ getLabel(currentLabel.language, 'city') }}:</span>
            <span class="label-value">{{ currentLabel.package?.customer?.city }}</span>
          </div>
          <div class="label-row">
            <span class="label-key">{{ getLabel(currentLabel.language, 'postal_code') }}:</span>
            <span class="label-value">{{ currentLabel.package?.customer?.postal_code }}</span>
          </div>
          <div class="label-row">
            <span class="label-key">{{ getLabel(currentLabel.language, 'weight') }}:</span>
            <span class="label-value">{{ currentLabel.package?.weight }} kg</span>
          </div>
        </div>

        <div class="label-barcodes">
          <div class="barcode-item">
            <p class="barcode-label">CODE128</p>
            <img v-if="currentLabel.barcode_url" :src="currentLabel.barcode_url" style="max-width: 250px;" />
            <p class="barcode-text">{{ currentLabel.tracking_no }}</p>
          </div>
          <div class="barcode-item">
            <p class="barcode-label">QR Code</p>
            <img v-if="currentLabel.qr_code_url" :src="currentLabel.qr_code_url" style="max-width: 150px;" />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { labelAPI } from '../api'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filterLang = ref('')
const showPreviewDialog = ref(false)
const currentLabel = ref(null)

const languageLabels = {
  en: { tracking_number: 'Tracking Number', recipient: 'Recipient', phone: 'Phone', address: 'Address', city: 'City', postal_code: 'Postal Code', weight: 'Weight' },
  es: { tracking_number: 'Número de Seguimiento', recipient: 'Destinatario', phone: 'Teléfono', address: 'Dirección', city: 'Ciudad', postal_code: 'Código Postal', weight: 'Peso' },
  ar: { tracking_number: 'رقم التتبع', recipient: 'المستلم', phone: 'الهاتف', address: 'العنوان', city: 'المدينة', postal_code: 'الرمز البريدي', weight: 'الوزن' },
  fr: { tracking_number: 'Numéro de Suivi', recipient: 'Destinataire', phone: 'Téléphone', address: 'Adresse', city: 'Ville', postal_code: 'Code Postal', weight: 'Poids' },
  de: { tracking_number: 'Sendungsnummer', recipient: 'Empfänger', phone: 'Telefon', address: 'Adresse', city: 'Stadt', postal_code: 'Postleitzahl', weight: 'Gewicht' }
}

const getLangName = (lang) => {
  const names = { en: '英语', es: '西班牙语', ar: '阿拉伯语', fr: '法语', de: '德语' }
  return names[lang] || lang
}

const getLabel = (lang, key) => {
  return languageLabels[lang]?.[key] || languageLabels['en'][key]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await labelAPI.list({
      page: page.value, page_size: pageSize.value, language: filterLang.value
    })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const viewLabel = async (row) => {
  try {
    const res = await labelAPI.get(row.package_id, row.language)
    currentLabel.value = res.data
    currentLabel.label_no = row.label_no
    currentLabel.tracking_no = row.tracking_no
    currentLabel.language = row.language
    showPreviewDialog.value = true
  } catch (e) {
    console.error(e)
  }
}

const downloadLabel = (row) => {
  window.open(`/api/v1/labels/${row.package_id}/image?lang=${row.language}`, '_blank')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.label-preview {
  border: 2px solid #333;
  padding: 20px;
  background: #fff;
  max-width: 600px;
  margin: 0 auto;
}
.label-preview[dir='rtl'] {
  text-align: right;
}
.label-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
  margin-bottom: 15px;
}
.label-header h2 {
  margin: 0;
  font-size: 20px;
}
.label-no {
  font-size: 14px;
  color: #666;
}
.label-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}
.label-preview[dir='rtl'] .label-row {
  flex-direction: row-reverse;
}
.label-key {
  font-weight: bold;
  width: 140px;
  flex-shrink: 0;
}
.label-value {
  flex: 1;
}
.label-barcodes {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ccc;
}
.barcode-item {
  text-align: center;
}
.barcode-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}
.barcode-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  margin-top: 5px;
  letter-spacing: 2px;
}
</style>
