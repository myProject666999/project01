<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWaterQualities, createWaterQuality, updateWaterQuality, deleteWaterQuality, getWaterQualityTrend } from '@/api/water-quality'
import { getSeaAreas } from '@/api/sea-area'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent])

interface WaterQualityForm {
  id?: number
  areaId: number | string
  salinity: number | string
  temperature: number | string
  dissolvedOxygen: number | string
  phValue: number | string
  monitorTime: string
  remarks: string
}

const defaultForm: WaterQualityForm = {
  areaId: '',
  salinity: '',
  temperature: '',
  dissolvedOxygen: '',
  phValue: '',
  monitorTime: '',
  remarks: '',
}

const filterAreaId = ref('')
const filterDateRange = ref<[string, string] | null>(null)

const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

const areaOptions = ref<any[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref()
const form = reactive<WaterQualityForm>({ ...defaultForm })

const trendData = ref<any[]>([])
const trendAreaId = ref('')

const formRules = reactive({
  areaId: [{ required: true, message: '请选择海域', trigger: 'change' }],
  salinity: [{ required: true, message: '请输入盐度', trigger: 'blur' }],
  temperature: [{ required: true, message: '请输入温度', trigger: 'blur' }],
  dissolvedOxygen: [{ required: true, message: '请输入溶解氧', trigger: 'blur' }],
  phValue: [{ required: true, message: '请输入pH值', trigger: 'blur' }],
  monitorTime: [{ required: true, message: '请选择监测时间', trigger: 'change' }],
})

const isSalinityAbnormal = (val: number) => val < 25 || val > 35
const isTemperatureAbnormal = (val: number) => val < 10 || val > 30
const isDissolvedOxygenAbnormal = (val: number) => val < 5

const isRowAbnormal = (row: any) => {
  if (row.salinity != null && isSalinityAbnormal(row.salinity)) return true
  if (row.temperature != null && isTemperatureAbnormal(row.temperature)) return true
  if (row.dissolvedOxygen != null && isDissolvedOxygenAbnormal(row.dissolvedOxygen)) return true
  return false
}

const rowClassName = ({ row }: { row: any }) => {
  return isRowAbnormal(row) ? 'abnormal-row' : ''
}

const formatMonitorTime = (val: string) => {
  if (!val) return ''
  const d = new Date(val)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const fetchAreas = async () => {
  try {
    const res = await getSeaAreas({ page: 1, size: 1000 })
    if (res.data) areaOptions.value = res.data.records || []
  } catch {}
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: page.value, size: size.value }
    if (filterAreaId.value) params.areaId = filterAreaId.value
    if (filterDateRange.value && filterDateRange.value.length === 2) {
      params.startTime = filterDateRange.value[0]
      params.endTime = filterDateRange.value[1]
    }
    const res = await getWaterQualities(params)
    if (res.data) {
      tableData.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch {
    ElMessage.error('获取水质监测数据失败')
  } finally {
    loading.value = false
  }
}

const fetchTrendData = async () => {
  if (!trendAreaId.value) {
    trendData.value = []
    return
  }
  try {
    const res = await getWaterQualityTrend({ areaId: trendAreaId.value })
    if (res.data) {
      trendData.value = Array.isArray(res.data) ? res.data : []
    }
  } catch {
    trendData.value = []
  }
}

const handleSearch = () => {
  page.value = 1
  fetchData()
}

const handleReset = () => {
  filterAreaId.value = ''
  filterDateRange.value = null
  page.value = 1
  fetchData()
}

const handleAdd = () => {
  dialogTitle.value = '新增水质监测'
  Object.assign(form, { ...defaultForm, id: undefined })
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑水质监测'
  Object.assign(form, {
    id: row.id,
    areaId: row.areaId,
    salinity: row.salinity,
    temperature: row.temperature,
    dissolvedOxygen: row.dissolvedOxygen,
    phValue: row.phValue,
    monitorTime: row.monitorTime,
    remarks: row.remarks || '',
  })
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定删除该水质监测记录吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteWaterQuality(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    const payload = { ...form }
    if (form.id) {
      await updateWaterQuality(form.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createWaterQuality(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error(form.id ? '更新失败' : '新增失败')
  }
}

const handlePageChange = (val: number) => {
  page.value = val
  fetchData()
}

const handleSizeChange = (val: number) => {
  size.value = val
  page.value = 1
  fetchData()
}

const handleTrendAreaChange = () => {
  fetchTrendData()
}

const chartOption = computed(() => {
  const dates = trendData.value.map((item: any) => {
    const d = new Date(item.monitorTime)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  })
  const salinityData = trendData.value.map((item: any) => item.salinity)
  const temperatureData = trendData.value.map((item: any) => item.temperature)
  const dissolvedOxygenData = trendData.value.map((item: any) => item.dissolvedOxygen)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748B' },
    },
    grid: {
      top: 30,
      right: 60,
      bottom: 50,
      left: 60,
    },
    xAxis: {
      type: 'category' as const,
      data: dates,
      axisLine: { lineStyle: { color: '#E2E8F0' } },
      axisLabel: { color: '#64748B' },
    },
    yAxis: [
      {
        type: 'value' as const,
        name: '盐度(‰)/温度(℃)',
        nameTextStyle: { color: '#64748B' },
        axisLabel: { color: '#64748B' },
        splitLine: { lineStyle: { color: '#F0F4F8' } },
      },
      {
        type: 'value' as const,
        name: '溶解氧(mg/L)',
        nameTextStyle: { color: '#64748B' },
        axisLabel: { color: '#64748B' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '盐度',
        type: 'line' as const,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#0A2647' },
        itemStyle: { color: '#0A2647' },
        data: salinityData,
      },
      {
        name: '温度',
        type: 'line' as const,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#2C7865' },
        itemStyle: { color: '#2C7865' },
        data: temperatureData,
      },
      {
        name: '溶解氧',
        type: 'line' as const,
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#E76F51' },
        itemStyle: { color: '#E76F51' },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(231, 111, 81, 0.15)' },
              { offset: 1, color: 'rgba(231, 111, 81, 0.02)' },
            ],
          },
        },
        data: dissolvedOxygenData,
      },
    ],
  }
})

onMounted(() => {
  fetchAreas()
  fetchData()
})
</script>

<template>
  <div class="water-quality-page">
    <div class="page-card">
      <div class="filter-bar">
        <el-select v-model="filterAreaId" placeholder="选择海域" clearable style="width: 160px">
          <el-option
            v-for="area in areaOptions"
            :key="area.id"
            :label="area.areaName"
            :value="area.id"
          />
        </el-select>
        <el-date-picker
          v-model="filterDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 280px"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" style="margin-left: auto" @click="handleAdd">新增监测</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe :row-class-name="rowClassName" style="width: 100%">
        <el-table-column prop="areaName" label="海域名称" min-width="120" />
        <el-table-column label="盐度(‰)" min-width="110" align="center">
          <template #default="{ row }">
            <span v-if="row.salinity != null && isSalinityAbnormal(row.salinity)" class="abnormal-value">
              <el-icon><Warning /></el-icon>
              {{ row.salinity }}
            </span>
            <span v-else>{{ row.salinity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="温度(℃)" min-width="110" align="center">
          <template #default="{ row }">
            <span v-if="row.temperature != null && isTemperatureAbnormal(row.temperature)" class="abnormal-value">
              <el-icon><Warning /></el-icon>
              {{ row.temperature }}
            </span>
            <span v-else>{{ row.temperature }}</span>
          </template>
        </el-table-column>
        <el-table-column label="溶解氧(mg/L)" min-width="130" align="center">
          <template #default="{ row }">
            <span v-if="row.dissolvedOxygen != null && isDissolvedOxygenAbnormal(row.dissolvedOxygen)" class="abnormal-value">
              <el-icon><Warning /></el-icon>
              {{ row.dissolvedOxygen }}
            </span>
            <span v-else>{{ row.dissolvedOxygen }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phValue" label="pH值" min-width="90" align="center" />
        <el-table-column label="监测时间" min-width="160">
          <template #default="{ row }">
            {{ formatMonitorTime(row.monitorTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <div class="page-card" style="margin-top: 16px">
      <div class="section-card__header">
        <span class="section-card__title">水质趋势图</span>
        <el-select v-model="trendAreaId" placeholder="选择海域查看趋势" clearable style="width: 200px" @change="handleTrendAreaChange">
          <el-option
            v-for="area in areaOptions"
            :key="area.id"
            :label="area.areaName"
            :value="area.id"
          />
        </el-select>
      </div>
      <div class="chart-body">
        <VChart v-if="trendData.length" :option="chartOption" autoresize class="trend-chart" />
        <el-empty v-else description="请选择海域查看水质趋势" :image-size="80" />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="110px">
        <el-form-item label="海域" prop="areaId">
          <el-select v-model="form.areaId" placeholder="请选择海域" style="width: 100%">
            <el-option
              v-for="area in areaOptions"
              :key="area.id"
              :label="area.areaName"
              :value="area.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="盐度(‰)" prop="salinity">
          <el-input-number v-model="form.salinity" :precision="2" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item label="温度(℃)" prop="temperature">
          <el-input-number v-model="form.temperature" :precision="2" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item label="溶解氧(mg/L)" prop="dissolvedOxygen">
          <el-input-number v-model="form.dissolvedOxygen" :precision="2" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item label="pH值" prop="phValue">
          <el-input-number v-model="form.phValue" :precision="2" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item label="监测时间" prop="monitorTime">
          <el-date-picker
            v-model="form.monitorTime"
            type="datetime"
            placeholder="请选择监测时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="form.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.water-quality-page {
  padding: 4px;
}

.page-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.section-card__header {
  padding: 0 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-card__title {
  font-size: 16px;
  font-weight: 600;
  color: #0A2647;
  position: relative;
  padding-left: 12px;
}

.section-card__title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #0A2647, #2C7865);
}

.chart-body {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trend-chart {
  width: 100%;
  height: 380px;
}

.abnormal-value {
  color: #E76F51;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

:deep(.abnormal-row) {
  --el-table-tr-bg-color: #FFF1F0 !important;
}

:deep(.el-table--striped .abnormal-row.el-table__row--striped) {
  --el-table-tr-bg-color: #FFF1F0 !important;
}

:deep(.el-button--primary) {
  --el-button-bg-color: #0A2647;
  --el-button-border-color: #0A2647;
  --el-button-hover-bg-color: #144272;
  --el-button-hover-border-color: #144272;
}
</style>
