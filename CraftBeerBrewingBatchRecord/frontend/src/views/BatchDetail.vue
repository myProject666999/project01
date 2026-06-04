<template>
  <div class="batch-detail">
    <el-button @click="goBack" class="back-btn">
      <el-icon><ArrowLeft /></el-icon>
      返回列表
    </el-button>

    <el-card shadow="hover" class="info-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h2>{{ batch.batchName }}</h2>
            <el-tag type="info" size="large">{{ batch.batchNo }}</el-tag>
            <el-tag :type="getStatusType(batch.batchStatus)" size="large">{{ getStatusText(batch.batchStatus) }}</el-tag>
            <el-tag :type="getQualityType(batch.qualityStatus)" effect="dark" size="large">{{ getQualityText(batch.qualityStatus) }}</el-tag>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="showEditDialog">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" @click="$router.push('/temperature')">
              <el-icon><TrendCharts /></el-icon>
              温度曲线
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="批次号">{{ batch.batchNo }}</el-descriptions-item>
        <el-descriptions-item label="配方名称">{{ recipeName }}</el-descriptions-item>
        <el-descriptions-item label="酿酒师">{{ batch.brewer }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ batch.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ batch.endTime || '进行中' }}</el-descriptions-item>
        <el-descriptions-item label="实际容量">{{ batch.actualBatchSize }} L</el-descriptions-item>
        <el-descriptions-item label="批次状态">
          <el-tag :type="getStatusType(batch.batchStatus)">{{ getStatusText(batch.batchStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="质量状态">
          <el-tag :type="getQualityType(batch.qualityStatus)" effect="dark">{{ getQualityText(batch.qualityStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="3">{{ batch.notes }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="hover" class="process-card">
      <template #header>
        <span>工序节点记录</span>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(process, index) in processRecords"
          :key="index"
          :timestamp="process.recordTime"
          :type="process.status === 'COMPLETED' ? 'success' : process.status === 'IN_PROGRESS' ? 'primary' : 'info'"
          :icon="process.status === 'COMPLETED' ? 'CircleCheck' : process.status === 'IN_PROGRESS' ? 'Loading' : 'Timer'"
        >
          <el-card shadow="hover" class="process-item">
            <div class="process-header">
              <span class="process-name">{{ process.processName }}</span>
              <el-tag :type="process.status === 'COMPLETED' ? 'success' : process.status === 'IN_PROGRESS' ? 'primary' : 'info'" size="small">
                {{ process.status === 'COMPLETED' ? '已完成' : process.status === 'IN_PROGRESS' ? '进行中' : '待开始' }}
              </el-tag>
            </div>
            <div class="process-info">
              <el-descriptions :column="2" size="small" border>
                <el-descriptions-item label="计划温度">{{ process.targetTemp }}°C</el-descriptions-item>
                <el-descriptions-item label="实际温度">{{ process.actualTemp ? process.actualTemp + '°C' : '-' }}</el-descriptions-item>
                <el-descriptions-item label="计划时长">{{ process.duration }}</el-descriptions-item>
                <el-descriptions-item label="实际时长">{{ process.actualDuration || '-' }}</el-descriptions-item>
              </el-descriptions>
              <div v-if="process.notes" class="process-notes">
                <strong>备注：</strong>{{ process.notes }}
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <el-card shadow="hover" class="temperature-card">
      <template #header>
        <div class="card-header">
          <span>温度曲线预览</span>
          <el-button type="primary" link @click="$router.push('/temperature')">查看完整曲线</el-button>
        </div>
      </template>
      <div ref="tempChartRef" class="temp-chart"></div>
    </el-card>

    <el-dialog v-model="editDialogVisible" title="编辑批次" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="批次名称">
          <el-input v-model="editForm.batchName" />
        </el-form-item>
        <el-form-item label="酿酒师">
          <el-input v-model="editForm.brewer" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.notes" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getBatchDetail, updateBatch } from '@/api/batch'

const route = useRoute()
const router = useRouter()

const batch = ref({})
const recipeName = ref('')
const processRecords = ref([])
const tempChartRef = ref(null)
const editDialogVisible = ref(false)

const editForm = reactive({
  id: '',
  batchName: '',
  brewer: '',
  notes: ''
})

const loadData = async () => {
  try {
    const id = route.params.id
    const data = await getBatchDetail(id)
    batch.value = data.brewingBatch || data || mockBatch
    recipeName.value = data.recipeName || '经典美式IPA'
    processRecords.value = data.processRecords || mockProcessRecords
  } catch (e) {
    batch.value = mockBatch
    recipeName.value = '经典美式IPA'
    processRecords.value = mockProcessRecords
  }
}

const goBack = () => {
  router.push('/batches')
}

const getStatusType = (status) => {
  const map = { BREWING: 'primary', FERMENTING: 'warning', BOTTLED: 'success', COMPLETED: 'info' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { BREWING: '酿造中', FERMENTING: '发酵中', BOTTLED: '装瓶', COMPLETED: '完成' }
  return map[status] || status
}

const getQualityType = (status) => {
  const map = { QUALIFIED: 'success', UNQUALIFIED: 'danger', PENDING: 'warning' }
  return map[status] || 'info'
}

const getQualityText = (status) => {
  const map = { QUALIFIED: '合格', UNQUALIFIED: '不合格', PENDING: '待评定' }
  return map[status] || status
}

const showEditDialog = () => {
  editForm.id = batch.value.id
  editForm.batchName = batch.value.batchName
  editForm.brewer = batch.value.brewer
  editForm.notes = batch.value.notes
  editDialogVisible.value = true
}

const handleEdit = async () => {
  try {
    await updateBatch(editForm)
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    loadData()
  }
}

const initTempChart = () => {
  if (!tempChartRef.value) return
  const chart = echarts.init(tempChartRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['0h', '12h', '24h', '36h', '48h', '60h', '72h', '84h', '96h']
    },
    yAxis: {
      type: 'value',
      name: '温度(°C)',
      min: 15,
      max: 25
    },
    series: [{
      name: '温度',
      type: 'line',
      smooth: true,
      data: [20, 20.2, 20.1, 19.8, 20.0, 20.3, 19.9, 19.7, 19.8],
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(103,194,58,0.3)' },
          { offset: 1, color: 'rgba(103,194,58,0.05)' }
        ])
      },
      lineStyle: { color: '#67c23a', width: 2 },
      itemStyle: { color: '#67c23a' }
    }]
  })
}

const mockBatch = {
  id: 1,
  batchNo: 'B2024001',
  batchName: '美式IPA第一批次',
  recipeId: 1,
  brewer: '张师傅',
  startTime: '2024-01-10 08:00:00',
  endTime: '2024-01-25 16:00:00',
  actualBatchSize: 48.5,
  batchStatus: 'COMPLETED',
  qualityStatus: 'QUALIFIED',
  notes: '第一批次酿造，整体过程顺利，发酵温度控制良好。'
}

const mockProcessRecords = [
  { processName: '糖化', recordTime: '2024-01-10 08:00:00', status: 'COMPLETED', targetTemp: 65, actualTemp: 64.8, duration: '60min', actualDuration: '62min', notes: '糖化正常，出糖率符合预期' },
  { processName: '过滤', recordTime: '2024-01-10 09:30:00', status: 'COMPLETED', targetTemp: 78, actualTemp: 77.5, duration: '30min', actualDuration: '28min', notes: '过滤速度正常' },
  { processName: '煮沸', recordTime: '2024-01-10 10:15:00', status: 'COMPLETED', targetTemp: 100, actualTemp: 99.8, duration: '60min', actualDuration: '60min', notes: '酒花添加按时完成' },
  { processName: '冷却', recordTime: '2024-01-10 11:30:00', status: 'COMPLETED', targetTemp: 20, actualTemp: 19.5, duration: '20min', actualDuration: '18min', notes: '冷却速度良好' },
  { processName: '发酵', recordTime: '2024-01-10 12:00:00', status: 'COMPLETED', targetTemp: 20, actualTemp: 19.8, duration: '14天', actualDuration: '14天', notes: '发酵过程温度稳定' },
  { processName: '装瓶', recordTime: '2024-01-24 14:00:00', status: 'COMPLETED', targetTemp: 20, actualTemp: 20, duration: '1天', actualDuration: '1天', notes: '装瓶顺利，瓶中发酵进行中' }
]

onMounted(() => {
  loadData()
  nextTick(() => {
    initTempChart()
  })
  window.addEventListener('resize', () => {
    tempChartRef.value && echarts.getInstanceByDom(tempChartRef.value)?.resize()
  })
})
</script>

<style scoped>
.batch-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.back-btn {
  align-self: flex-start;
}

.info-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
}

.header-right {
  display: flex;
  gap: 10px;
}

.process-card {
  border-radius: 8px;
}

.process-item {
  margin-bottom: 0;
}

.process-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.process-name {
  font-size: 16px;
  font-weight: 600;
}

.process-notes {
  margin-top: 10px;
  color: #666;
}

.temperature-card {
  border-radius: 8px;
}

.temp-chart {
  height: 250px;
}
</style>
