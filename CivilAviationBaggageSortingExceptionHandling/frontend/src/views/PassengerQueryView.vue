<template>
  <div>
    <el-card shadow="never" style="margin-bottom: 16px">
      <h2 style="margin: 0; font-size: 20px">旅客自助查询</h2>
    </el-card>

    <el-card shadow="never">
      <div style="max-width: 500px; margin: 0 auto; padding: 40px 0">
        <div style="text-align: center; margin-bottom: 30px">
          <el-icon :size="48" color="#1890ff"><Search /></el-icon>
          <h3 style="margin: 12px 0 4px">行李查询</h3>
          <p style="color: #999; margin: 0">输入姓名和行李牌号，查询行李当前位置和状态</p>
        </div>

        <el-form :model="queryForm" label-width="100px" @submit.prevent="handleQuery">
          <el-form-item label="旅客姓名">
            <el-input v-model="queryForm.name" placeholder="请输入姓名" size="large" />
          </el-form-item>
          <el-form-item label="行李牌号">
            <el-input v-model="queryForm.tag_code" placeholder="请输入10位行李牌号" maxlength="10" size="large" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" style="width: 100%" @click="handleQuery" :loading="loading">查询行李</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card v-if="queryResult" shadow="never" style="margin-top: 16px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>查询结果</span>
          <el-tag :type="statusType(queryResult.status)" size="large">{{ queryResult.status_label }}</el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="行李牌号">{{ queryResult.tag_code }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="statusType(queryResult.status)">{{ queryResult.status_label }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前位置">{{ queryResult.last_location }}</el-descriptions-item>
        <el-descriptions-item label="最后扫描">{{ formatTime(queryResult.last_scan_time) }}</el-descriptions-item>
        <el-descriptions-item label="旅客姓名">{{ queryResult.passenger?.name }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ queryResult.passenger?.phone }}</el-descriptions-item>
        <el-descriptions-item label="航班号">{{ queryResult.flight?.flight_no }}</el-descriptions-item>
        <el-descriptions-item label="航线">{{ queryResult.flight?.departure_city }} → {{ queryResult.flight?.arrival_city }}</el-descriptions-item>
        <el-descriptions-item label="计划出发">{{ formatTime(queryResult.flight?.scheduled_departure) }}</el-descriptions-item>
        <el-descriptions-item label="计划到达">{{ formatTime(queryResult.flight?.scheduled_arrival) }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="queryResult.scan_trace && queryResult.scan_trace.length > 0" style="margin-top: 20px">
        <h4 style="margin: 0 0 12px">行李流转轨迹</h4>
        <el-timeline>
          <el-timeline-item
            v-for="(step, idx) in queryResult.scan_trace"
            :key="idx"
            :timestamp="formatTime(step.time)"
            placement="top"
            :type="idx === queryResult.scan_trace.length - 1 ? 'primary' : 'info'"
          >
            {{ step.location }}
            <span v-if="step.operator" style="color: #999; margin-left: 8px">操作员: {{ step.operator }}</span>
          </el-timeline-item>
        </el-timeline>
      </div>

      <div v-if="queryResult.exceptions && queryResult.exceptions.length > 0" style="margin-top: 20px">
        <h4 style="margin: 0 0 12px; color: #e6a23c">异常记录</h4>
        <el-alert
          v-for="(ex, idx) in queryResult.exceptions"
          :key="idx"
          :title="`${typeLabel(ex.type)} - ${ex.status === 'RESOLVED' ? '已解决' : '处理中'}`"
          :description="ex.description"
          :type="ex.status === 'RESOLVED' ? 'success' : 'warning'"
          show-icon
          style="margin-bottom: 8px"
        />
      </div>

      <div v-if="queryResult.notifications && queryResult.notifications.length > 0" style="margin-top: 20px">
        <h4 style="margin: 0 0 12px">通知记录</h4>
        <el-card v-for="(n, idx) in queryResult.notifications" :key="idx" shadow="never" style="margin-bottom: 8px; background: #fafafa">
          <p style="margin: 0">{{ n.content }}</p>
          <p style="margin: 4px 0 0; color: #999; font-size: 12px">{{ formatTime(n.sent_at) }}</p>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { queryBaggage } from '../api'
import { ElMessage } from 'element-plus'

const queryForm = ref({ name: '', tag_code: '' })
const queryResult = ref(null)
const loading = ref(false)

const statusTypeMap = {
  CHECKED_IN: 'info', SORTED: '', LOADED: 'success', DELIVERED: 'success',
  MISROUTED: 'danger', DELAYED: 'warning', DAMAGED: 'warning', LOST: 'danger',
}
const typeLabels = { MISROUTED: '错运', DELAYED: '迟到', DAMAGED: '破损', LOST: '丢失' }

const statusType = (s) => statusTypeMap[s] || 'info'
const typeLabel = (t) => typeLabels[t] || t
const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'

async function handleQuery() {
  if (!queryForm.value.name || !queryForm.value.tag_code) {
    ElMessage.warning('请输入姓名和行李牌号')
    return
  }
  loading.value = true
  try {
    queryResult.value = await queryBaggage(queryForm.value)
  } catch (e) {
    queryResult.value = null
    ElMessage.error('未找到匹配的行李信息，请检查姓名和行李牌号')
  } finally {
    loading.value = false
  }
}
</script>
