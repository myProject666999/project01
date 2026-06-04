<template>
  <div>
    <el-card shadow="never" style="margin-bottom: 16px">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <h2 style="margin: 0; font-size: 20px">异常工单管理</h2>
        <div style="display: flex; gap: 8px">
          <el-button @click="loadSlaWarnings" type="warning" size="small">
            <el-icon><Timer /></el-icon> SLA预警
          </el-button>
          <el-button type="primary" size="small" @click="createDialogVisible = true">
            <el-icon><Plus /></el-icon> 新建工单
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <div style="display: flex; gap: 12px; margin-bottom: 16px; align-items: center">
        <el-select v-model="statusFilter" placeholder="按状态筛选" clearable style="width: 140px" @change="loadExceptions">
          <el-option label="待处理" value="PENDING" />
          <el-option label="处理中" value="PROCESSING" />
          <el-option label="已解决" value="RESOLVED" />
          <el-option label="已关闭" value="CLOSED" />
        </el-select>
        <el-select v-model="typeFilter" placeholder="按类型筛选" clearable style="width: 140px" @change="loadExceptions">
          <el-option label="错运" value="MISROUTED" />
          <el-option label="迟到" value="DELAYED" />
          <el-option label="破损" value="DAMAGED" />
          <el-option label="丢失" value="LOST" />
        </el-select>
      </div>

      <el-table :data="exceptions" stripe border style="width: 100%">
        <el-table-column prop="id" label="工单号" width="80" />
        <el-table-column label="行李牌号" width="130">
          <template #default="{ row }">{{ row.baggage?.tag_code || '-' }}</template>
        </el-table-column>
        <el-table-column label="旅客" width="80">
          <template #default="{ row }">{{ row.baggage?.passenger?.name || '-' }}</template>
        </el-table-column>
        <el-table-column prop="exception_type" label="异常类型" width="90">
          <template #default="{ row }">
            <el-tag :type="typeColor(row.exception_type)" size="small">{{ typeLabel(row.exception_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusColor(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" width="90" />
        <el-table-column label="SLA倒计时" width="150">
          <template #default="{ row }">
            <span v-if="row.sla_remaining_ms !== null" :style="{ color: row.sla_expired ? '#f56c6c' : row.sla_remaining_ms < 1800000 ? '#e6a23c' : '#67c23a', fontWeight: 'bold' }">
              {{ row.sla_expired ? '⚠ 已超时' : formatSla(row.sla_remaining_ms) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewException(row.id)">详情</el-button>
            <el-button size="small" type="primary" @click="openProcessDialog(row)" :disabled="row.status === 'RESOLVED' || row.status === 'CLOSED'">处理</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        :page-size="limit"
        :total="total"
        layout="total, prev, pager, next"
        style="margin-top: 16px; justify-content: flex-end"
        @current-change="loadExceptions"
      />
    </el-card>

    <el-dialog v-model="createDialogVisible" title="新建异常工单" width="500px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="行李ID"><el-input v-model.number="createForm.baggage_id" placeholder="输入行李ID" /></el-form-item>
        <el-form-item label="异常类型">
          <el-select v-model="createForm.exception_type" placeholder="请选择">
            <el-option label="错运" value="MISROUTED" />
            <el-option label="迟到" value="DELAYED" />
            <el-option label="破损" value="DAMAGED" />
            <el-option label="丢失" value="LOST" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述"><el-input v-model="createForm.description" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建工单</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="processDialogVisible" title="处理异常工单" width="500px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="状态">
          <el-select v-model="processForm.status">
            <el-option label="处理中" value="PROCESSING" />
            <el-option label="已解决" value="RESOLVED" />
            <el-option label="已关闭" value="CLOSED" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理人"><el-input v-model="processForm.handler" /></el-form-item>
        <el-form-item label="处理结果"><el-input v-model="processForm.resolution" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleProcess">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="工单详情" width="650px">
      <el-descriptions v-if="currentException" :column="2" border>
        <el-descriptions-item label="工单号">{{ currentException.id }}</el-descriptions-item>
        <el-descriptions-item label="异常类型">
          <el-tag :type="typeColor(currentException.exception_type)">{{ typeLabel(currentException.exception_type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusColor(currentException.status)">{{ statusLabel(currentException.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理人">{{ currentException.handler || '未分配' }}</el-descriptions-item>
        <el-descriptions-item label="行李牌号">{{ currentException.baggage?.tag_code }}</el-descriptions-item>
        <el-descriptions-item label="旅客">{{ currentException.baggage?.passenger?.name }}</el-descriptions-item>
        <el-descriptions-item label="SLA截止" :span="2">{{ formatTime(currentException.sla_deadline) }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ currentException.description }}</el-descriptions-item>
        <el-descriptions-item label="处理结果" :span="2">{{ currentException.resolution || '暂无' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="slaDialogVisible" title="SLA预警 - 即将超时或已超时的工单" width="800px">
      <el-table :data="slaWarnings" stripe border size="small">
        <el-table-column prop="id" label="工单号" width="80" />
        <el-table-column prop="exception_type" label="类型" width="80">
          <template #default="{ row }">{{ typeLabel(row.exception_type) }}</template>
        </el-table-column>
        <el-table-column label="行李牌号" width="130">
          <template #default="{ row }">{{ row.baggage?.tag_code }}</template>
        </el-table-column>
        <el-table-column label="SLA截止" width="180">
          <template #default="{ row }">{{ formatTime(row.sla_deadline) }}</template>
        </el-table-column>
        <el-table-column prop="handler" label="处理人" width="100" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getExceptions, getException, createException, updateException, getSlaWarnings } from '../api'
import { ElMessage } from 'element-plus'

const exceptions = ref([])
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const statusFilter = ref('')
const typeFilter = ref('')

const createDialogVisible = ref(false)
const createForm = ref({ baggage_id: null, exception_type: '', description: '' })

const processDialogVisible = ref(false)
const processForm = ref({ id: null, status: '', handler: '', resolution: '' })

const detailDialogVisible = ref(false)
const currentException = ref(null)

const slaDialogVisible = ref(false)
const slaWarnings = ref([])

const typeLabels = { MISROUTED: '错运', DELAYED: '迟到', DAMAGED: '破损', LOST: '丢失' }
const typeColors = { MISROUTED: 'danger', DELAYED: 'warning', DAMAGED: 'warning', LOST: 'danger' }
const statusLabels = { PENDING: '待处理', PROCESSING: '处理中', RESOLVED: '已解决', CLOSED: '已关闭' }
const statusColors = { PENDING: 'danger', PROCESSING: 'warning', RESOLVED: 'success', CLOSED: 'info' }

const typeLabel = (t) => typeLabels[t] || t
const typeColor = (t) => typeColors[t] || 'info'
const statusLabel = (s) => statusLabels[s] || s
const statusColor = (s) => statusColors[s] || 'info'
const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'

function formatSla(ms) {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${hours}时${minutes}分${seconds}秒`
}

async function loadExceptions() {
  const res = await getExceptions({
    page: page.value, limit: limit.value,
    status: statusFilter.value || undefined,
    type: typeFilter.value || undefined,
  })
  exceptions.value = res.items
  total.value = res.total
}

async function viewException(id) {
  currentException.value = await getException(id)
  detailDialogVisible.value = true
}

function openProcessDialog(row) {
  processForm.value = { id: row.id, status: row.status === 'PENDING' ? 'PROCESSING' : row.status, handler: row.handler || '', resolution: '' }
  processDialogVisible.value = true
}

async function handleCreate() {
  try {
    await createException(createForm.value)
    ElMessage.success('工单创建成功，已通知旅客')
    createDialogVisible.value = false
    createForm.value = { baggage_id: null, exception_type: '', description: '' }
    loadExceptions()
  } catch (e) { ElMessage.error('创建失败') }
}

async function handleProcess() {
  try {
    await updateException(processForm.value.id, {
      status: processForm.value.status,
      handler: processForm.value.handler,
      resolution: processForm.value.resolution,
    })
    ElMessage.success('工单更新成功')
    processDialogVisible.value = false
    loadExceptions()
  } catch (e) { ElMessage.error('更新失败') }
}

async function loadSlaWarnings() {
  slaWarnings.value = await getSlaWarnings()
  slaDialogVisible.value = true
}

onMounted(loadExceptions)
</script>
