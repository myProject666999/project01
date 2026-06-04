<template>
  <div>
    <el-card shadow="never" style="margin-bottom: 16px">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <h2 style="margin: 0; font-size: 20px">行李管理</h2>
        <el-button type="primary" @click="scanDialogVisible = true">
          <el-icon><Scan /></el-icon> 扫描行李条码
        </el-button>
      </div>
    </el-card>

    <el-card shadow="never">
      <div style="display: flex; gap: 12px; margin-bottom: 16px; align-items: center">
        <el-select v-model="statusFilter" placeholder="按状态筛选" clearable style="width: 160px" @change="loadBaggages">
          <el-option label="已值机" value="CHECKED_IN" />
          <el-option label="已分拣" value="SORTED" />
          <el-option label="已装机" value="LOADED" />
          <el-option label="已到达" value="DELIVERED" />
          <el-option label="错运" value="MISROUTED" />
          <el-option label="迟到" value="DELAYED" />
          <el-option label="破损" value="DAMAGED" />
          <el-option label="丢失" value="LOST" />
        </el-select>
      </div>

      <el-table :data="baggages" stripe border style="width: 100%">
        <el-table-column prop="tag_code" label="行李牌号" width="130" />
        <el-table-column label="旅客" width="90">
          <template #default="{ row }">{{ row.passenger?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="航班号" width="100">
          <template #default="{ row }">{{ row.flight?.flight_no || '-' }}</template>
        </el-table-column>
        <el-table-column label="航线" width="150">
          <template #default="{ row }">
            {{ row.flight?.departure_city || '' }} → {{ row.flight?.arrival_city || '' }}
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(kg)" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row.tag_code)">详情</el-button>
            <el-button size="small" type="primary" @click="viewScanLogs(row.id)">流水</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        :page-size="limit"
        :total="total"
        layout="total, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        @current-change="loadBaggages"
      />
    </el-card>

    <el-dialog v-model="scanDialogVisible" title="扫描行李条码" width="500px">
      <el-form :model="scanForm" label-width="100px">
        <el-form-item label="行李牌号">
          <el-input v-model="scanForm.tag_code" placeholder="请输入10位IATA条码" maxlength="10" />
        </el-form-item>
        <el-form-item label="扫描位置">
          <el-select v-model="scanForm.scan_location" placeholder="请选择扫描位置">
            <el-option label="值机柜台" value="值机柜台" />
            <el-option label="安检传输带" value="安检传输带" />
            <el-option label="分拣区入口" value="分拣区入口" />
            <el-option label="1号滑槽" value="1号滑槽" />
            <el-option label="2号滑槽" value="2号滑槽" />
            <el-option label="3号滑槽" value="3号滑槽" />
            <el-option label="装卸区" value="装卸区" />
            <el-option label="机坪" value="机坪" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作员">
          <el-input v-model="scanForm.operator" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scanDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleScan">确认扫描</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="行李详情" width="600px">
      <el-descriptions v-if="currentBaggage" :column="2" border>
        <el-descriptions-item label="行李牌号">{{ currentBaggage.tag_code }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(currentBaggage.status)">{{ statusLabel(currentBaggage.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="旅客">{{ currentBaggage.passenger?.name }}</el-descriptions-item>
        <el-descriptions-item label="证件号">{{ currentBaggage.passenger?.id_number }}</el-descriptions-item>
        <el-descriptions-item label="航班号">{{ currentBaggage.flight?.flight_no }}</el-descriptions-item>
        <el-descriptions-item label="航线">{{ currentBaggage.flight?.departure_city }} → {{ currentBaggage.flight?.arrival_city }}</el-descriptions-item>
        <el-descriptions-item label="重量">{{ currentBaggage.weight }} kg</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatTime(currentBaggage.created_at) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="scanLogDialogVisible" title="扫描流水" width="700px">
      <el-table :data="scanLogs" stripe border>
        <el-table-column prop="scan_location" label="扫描位置" />
        <el-table-column prop="scan_time" label="扫描时间">
          <template #default="{ row }">{{ formatTime(row.scan_time) }}</template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBaggages, getBaggageByTagCode, scanBaggage, getScanLogs } from '../api'
import { ElMessage } from 'element-plus'

const baggages = ref([])
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const statusFilter = ref('')

const scanDialogVisible = ref(false)
const scanForm = ref({ tag_code: '', scan_location: '', operator: '' })

const detailDialogVisible = ref(false)
const currentBaggage = ref(null)

const scanLogDialogVisible = ref(false)
const scanLogs = ref([])

const statusMap = {
  CHECKED_IN: '已值机', SORTED: '已分拣', LOADED: '已装机', DELIVERED: '已到达',
  MISROUTED: '错运', DELAYED: '迟到', DAMAGED: '破损', LOST: '丢失',
}
const statusTypeMap = {
  CHECKED_IN: 'info', SORTED: '', LOADED: 'success', DELIVERED: 'success',
  MISROUTED: 'danger', DELAYED: 'warning', DAMAGED: 'warning', LOST: 'danger',
}

const statusLabel = (s) => statusMap[s] || s
const statusType = (s) => statusTypeMap[s] || 'info'
const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'

async function loadBaggages() {
  const res = await getBaggages({ page: page.value, limit: limit.value, status: statusFilter.value || undefined })
  baggages.value = res.items
  total.value = res.total
}

async function viewDetail(tagCode) {
  const res = await getBaggageByTagCode(tagCode)
  currentBaggage.value = res
  detailDialogVisible.value = true
}

async function viewScanLogs(baggageId) {
  const res = await getScanLogs(baggageId)
  scanLogs.value = res
  scanLogDialogVisible.value = true
}

async function handleScan() {
  if (!scanForm.value.tag_code || !scanForm.value.scan_location) {
    ElMessage.warning('请填写行李牌号和扫描位置')
    return
  }
  try {
    const res = await scanBaggage(scanForm.value)
    if (res.idempotent) {
      ElMessage.info(res.message)
    } else {
      ElMessage.success(res.message)
    }
    scanDialogVisible.value = false
    scanForm.value = { tag_code: '', scan_location: '', operator: '' }
    loadBaggages()
  } catch (e) {
    ElMessage.error('扫描失败')
  }
}

onMounted(loadBaggages)
</script>
