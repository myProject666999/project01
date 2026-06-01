<template>
  <div class="evidence-chain">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="检材编号">
          <el-input
            v-model="searchForm.evidenceNo"
            placeholder="请输入检材编号"
            clearable
            @keyup.enter="handleSearch"
          />
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

    <el-card class="timeline-card" v-if="timelineData.length > 0">
      <template #header>
        <div class="card-header">
          <span>监管链 - {{ currentEvidence.evidenceNo || '检材信息' }}</span>
          <el-tag v-if="currentEvidence.sealedStatus" :type="getSealedStatusType(currentEvidence.sealedStatus)">
            {{ getSealedStatusText(currentEvidence.sealedStatus) }}
          </el-tag>
        </div>
      </template>
      <el-timeline :reverse="true">
        <el-timeline-item
          v-for="(item, index) in timelineData"
          :key="item.id"
          :timestamp="item.operateTime"
          :type="getTimelineType(item.operateType)"
          :color="getTimelineColor(item.operateType)"
          placement="top"
        >
          <el-card class="timeline-item-card" shadow="hover">
            <div class="timeline-header">
              <el-tag :type="getOperateType(item.operateType).type" size="large">
                {{ getOperateType(item.operateType).text }}
              </el-tag>
              <span class="operate-time">{{ item.operateTime }}</span>
            </div>
            <div class="timeline-content">
              <div class="info-row">
                <span class="label">操作人：</span>
                <span class="value">{{ item.operatorName || '-' }}</span>
              </div>
              <div class="info-row" v-if="item.signatureStatus">
                <span class="label">签名状态：</span>
                <span class="value signed">
                  <el-icon><Check /></el-icon>
                  已签名
                </span>
              </div>
              <div class="info-row" v-if="item.counterpartyName">
                <span class="label">对方人员：</span>
                <span class="value">{{ item.counterpartyName }}</span>
              </div>
              <div class="info-row" v-if="item.statusChange">
                <span class="label">状态变更：</span>
                <span class="value">
                  <el-tag :type="getStatusTagType(item.statusChange.from)" size="small">
                    {{ getStatusText(item.statusChange.from) }}
                  </el-tag>
                  <el-icon class="arrow-icon"><ArrowRight /></el-icon>
                  <el-tag :type="getStatusTagType(item.statusChange.to)" size="small">
                    {{ getStatusText(item.statusChange.to) }}
                  </el-tag>
                </span>
              </div>
              <div class="info-row" v-if="item.remark">
                <span class="label">备注：</span>
                <span class="value">{{ item.remark }}</span>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <el-empty v-else-if="!loading && searchForm.evidenceNo" description="未找到相关监管链数据" />
    <el-empty v-else-if="!loading" description="请输入检材编号进行搜索" />

    <el-card v-loading="loading" class="loading-card" v-if="loading">
      <el-skeleton :rows="5" animated />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Check, ArrowRight } from '@element-plus/icons-vue'
import { getChainTimeline } from '@/api/chain'
import { getEvidence } from '@/api/evidence'

const route = useRoute()
const loading = ref(false)
const timelineData = ref([])
const currentEvidence = ref({})

const searchForm = reactive({
  evidenceNo: ''
})

const sealedStatusMap = {
  UNSEALED: { text: '未封存', type: 'info' },
  SEALED: { text: '已封存', type: 'success' },
  OPENED: { text: '已启封', type: 'warning' }
}

const operateTypeMap = {
  RECEIVE: { text: '接收', type: 'primary', color: '#409EFF' },
  SEAL: { text: '封存', type: 'success', color: '#67C23A' },
  UNSEAL: { text: '启封', type: 'warning', color: '#E6A23C' },
  TRANSFER: { text: '交接', type: 'warning', color: '#E6A23C' },
  INSPECT: { text: '检验', type: 'info', color: '#909399' },
  STORE: { text: '入库', type: 'success', color: '#67C23A' },
  DESTROY: { text: '销毁', type: 'danger', color: '#F56C6C' },
  RETURN: { text: '退还', type: 'info', color: '#909399' }
}

const getSealedStatusText = (status) => sealedStatusMap[status]?.text || status
const getSealedStatusType = (status) => sealedStatusMap[status]?.type || 'info'
const getOperateType = (type) => operateTypeMap[type] || { text: type, type: 'info', color: '#909399' }
const getTimelineType = (type) => getOperateType(type).type
const getTimelineColor = (type) => getOperateType(type).color

const getStatusText = (status) => {
  const map = {
    SEALED: '已封存',
    UNSEALED: '未封存'
  }
  return map[status] || status
}

const getStatusTagType = (status) => {
  const map = {
    SEALED: 'success',
    UNSEALED: 'info'
  }
  return map[status] || 'info'
}

const fetchTimeline = async (evidenceId) => {
  loading.value = true
  try {
    const res = await getChainTimeline(evidenceId)
    if (res.code === 200) {
      timelineData.value = res.data || []
    }
  } catch (error) {
    console.error('获取监管链失败', error)
    ElMessage.error('获取监管链失败')
  } finally {
    loading.value = false
  }
}

const fetchEvidenceDetail = async (evidenceNo) => {
  try {
    const res = await getEvidence(evidenceNo)
    if (res.code === 200) {
      currentEvidence.value = res.data || {}
      if (res.data?.id) {
        fetchTimeline(res.data.id)
      }
    } else {
      ElMessage.warning('未找到该检材')
      timelineData.value = []
    }
  } catch (error) {
    console.error('获取检材信息失败', error)
    ElMessage.error('获取检材信息失败')
  }
}

const handleSearch = () => {
  if (!searchForm.evidenceNo) {
    ElMessage.warning('请输入检材编号')
    return
  }
  fetchEvidenceDetail(searchForm.evidenceNo)
}

const handleReset = () => {
  searchForm.evidenceNo = ''
  timelineData.value = []
  currentEvidence.value = {}
}

onMounted(() => {
  const evidenceNo = route.query.evidenceNo
  if (evidenceNo) {
    searchForm.evidenceNo = evidenceNo
    handleSearch()
  }
})
</script>

<style scoped>
.evidence-chain {
  padding: 0;
}

.search-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.timeline-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-item-card {
  margin-bottom: 10px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.operate-time {
  font-size: 12px;
  color: #909399;
}

.timeline-content .info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.timeline-content .label {
  color: #606266;
  min-width: 80px;
}

.timeline-content .value {
  color: #303133;
}

.timeline-content .signed {
  color: #67C23A;
  display: flex;
  align-items: center;
  gap: 4px;
}

.arrow-icon {
  margin: 0 8px;
  color: #909399;
}

.loading-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
</style>
