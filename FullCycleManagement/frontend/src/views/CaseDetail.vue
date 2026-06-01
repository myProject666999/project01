<template>
  <div class="case-detail">
    <el-card v-if="caseInfo" class="info-card">
      <template #header>
        <div class="card-header">
          <span>案件基本信息 - {{ caseInfo.caseNumber }}</span>
        </div>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="案件编号">{{ caseInfo.caseNumber }}</el-descriptions-item>
        <el-descriptions-item label="案件名称">{{ caseInfo.caseName }}</el-descriptions-item>
        <el-descriptions-item label="案件类型">{{ getCaseTypeLabel(caseInfo.caseType) }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getStatusTagType(caseInfo.status)">{{ getStatusLabel(caseInfo.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="受理法院">{{ caseInfo.court || '-' }}</el-descriptions-item>
        <el-descriptions-item label="承办法官">{{ caseInfo.judge || '-' }}</el-descriptions-item>
        <el-descriptions-item label="立案日期">{{ formatDate(caseInfo.filingDate) }}</el-descriptions-item>
        <el-descriptions-item label="开庭日期">{{ formatDate(caseInfo.hearingDate) }}</el-descriptions-item>
        <el-descriptions-item label="判决日期">{{ formatDate(caseInfo.judgmentDate) }}</el-descriptions-item>
        <el-descriptions-item label="案件描述" :span="3">{{ caseInfo.caseDescription || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="状态时间轴" name="timeline">
        <el-card>
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in statusLogs"
              :key="log.id"
              :timestamp="formatDate(log.createdAt)"
              :type="index === 0 ? 'primary' : ''"
            >
              <h4>{{ getStatusLabel(log.newStatus) }}</h4>
              <p>{{ log.changeReason }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="代理律师" name="lawyers">
        <el-card>
          <el-table :data="caseLawyers" border>
            <el-table-column prop="name" label="律师姓名" />
            <el-table-column prop="licenseNumber" label="执业证号" />
            <el-table-column prop="phone" label="电话" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="specialty" label="专业领域" />
            <el-table-column prop="hourlyRate" label="小时费率">
              <template #default="{ row }">¥{{ row.hourlyRate }}/小时</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="工时记录" name="workhours">
        <el-card>
          <el-table :data="workHours" border>
            <el-table-column prop="workDate" label="工作日期">
              <template #default="{ row }">{{ formatDate(row.workDate) }}</template>
            </el-table-column>
            <el-table-column prop="workType" label="工作类型" />
            <el-table-column prop="workContent" label="工作内容" />
            <el-table-column prop="workMinutes" label="时长(分钟)" />
            <el-table-column prop="billingUnits" label="计费单元" />
            <el-table-column prop="totalAmount" label="金额(元)">
              <template #default="{ row }">¥{{ row.totalAmount }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="文书记录" name="documents">
        <el-card>
          <el-table :data="documents" border>
            <el-table-column prop="docName" label="文书名称" />
            <el-table-column prop="docType" label="文书类型" />
            <el-table-column prop="createdAt" label="创建时间">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="开庭安排" name="sessions">
        <el-card>
          <el-table :data="courtSessions" border>
            <el-table-column prop="sessionTime" label="开庭时间">
              <template #default="{ row }">{{ formatDate(row.sessionTime) }}</template>
            </el-table-column>
            <el-table-column prop="courtRoom" label="法庭" />
            <el-table-column prop="judge" label="法官" />
            <el-table-column prop="clerk" label="书记员" />
            <el-table-column prop="notes" label="备注" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                {{ { 1: '待开庭', 2: '已开庭', 3: '已取消' }[row.status] }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { caseApi } from '../api'

const route = useRoute()
const caseInfo = ref(null)
const statusLogs = ref([])
const caseLawyers = ref([])
const workHours = ref([])
const documents = ref([])
const courtSessions = ref([])
const activeTab = ref('timeline')

const caseId = computed(() => route.params.id)

const statusLabels = {
  CONSULTATION: '咨询接洽',
  ACCEPTED: '已接受委托',
  FILING: '立案中',
  FILED: '已立案',
  HEARING: '庭审中',
  JUDGED: '已判决',
  EXECUTION: '执行中',
  CLOSED: '已结案',
  ARCHIVED: '已归档'
}

const getStatusLabel = (status) => statusLabels[status] || status

const getStatusTagType = (status) => {
  const types = {
    CONSULTATION: 'info',
    ACCEPTED: '',
    FILING: 'warning',
    FILED: 'primary',
    HEARING: 'danger',
    JUDGED: 'success',
    EXECUTION: 'warning',
    CLOSED: 'info',
    ARCHIVED: 'success'
  }
  return types[status] || 'info'
}

const getCaseTypeLabel = (type) => {
  const types = { 1: '民事', 2: '刑事', 3: '行政', 4: '仲裁', 5: '其他' }
  return types[type] || '未知'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const loadCaseDetail = async () => {
  if (!caseId.value) {
    const cases = await caseApi.getAll()
    if (cases.length > 0) {
      caseInfo.value = cases[0]
      loadRelatedData(cases[0].id)
    }
    return
  }

  try {
    const data = await caseApi.getById(caseId.value)
    caseInfo.value = data
    loadRelatedData(caseId.value)
  } catch (error) {
    console.error('加载案件详情失败:', error)
  }
}

const loadRelatedData = async (id) => {
  try {
    const [logs, lawyers, hours, docs, sessions] = await Promise.all([
      caseApi.getStatusLogs(id),
      caseApi.getLawyers(id),
      caseApi.getWorkHours(id),
      caseApi.getDocuments(id),
      caseApi.getCourtSessions(id)
    ])
    statusLogs.value = logs
    caseLawyers.value = lawyers
    workHours.value = hours
    documents.value = docs
    courtSessions.value = sessions
  } catch (error) {
    console.error('加载关联数据失败:', error)
  }
}

onMounted(() => {
  loadCaseDetail()
})
</script>

<style scoped>
.case-detail {
  padding: 0;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: 600;
  font-size: 16px;
}

.detail-tabs {
  margin-top: 20px;
}

:deep(.el-tabs__content) {
  padding: 0;
}
</style>
