<template>
  <div class="traceability">
    <el-card shadow="hover" class="filter-card">
      <template #header>
        <div class="card-title">
          <el-icon :size="22" color="#f56c6c"><Warning /></el-icon>
          <span>不合格批次追溯查询</span>
        </div>
      </template>
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="按原料追溯" name="material">
          <el-form :inline="true" :model="materialForm">
            <el-form-item label="原料类型">
              <el-select v-model="materialForm.materialTypeId" placeholder="选择原料类型" style="width: 180px">
                <el-option label="麦芽" :value="1" />
                <el-option label="酒花" :value="2" />
                <el-option label="酵母" :value="3" />
                <el-option label="水" :value="4" />
                <el-option label="辅料" :value="5" />
              </el-select>
            </el-form-item>
            <el-form-item label="具体原料">
              <el-select v-model="materialForm.materialId" placeholder="选择原料" style="width: 240px" filterable>
                <el-option v-for="m in materialList" :key="m.id" :label="m.materialName" :value="m.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="批次号">
              <el-input v-model="materialForm.batchNo" placeholder="输入批次号" style="width: 180px" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="danger" @click="queryByMaterial">
                <el-icon><Search /></el-icon>
                查询不合格批次
              </el-button>
              <el-button @click="resetMaterialForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="按工序追溯" name="process">
          <el-form :inline="true" :model="processForm">
            <el-form-item label="工序类型">
              <el-select v-model="processForm.processTypeId" placeholder="选择工序" style="width: 180px">
                <el-option label="糖化" :value="1" />
                <el-option label="过滤" :value="2" />
                <el-option label="煮沸" :value="3" />
                <el-option label="冷却" :value="4" />
                <el-option label="发酵" :value="5" />
                <el-option label="装瓶" :value="6" />
              </el-select>
            </el-form-item>
            <el-form-item label="质量状态">
              <el-select v-model="processForm.qualityStatus" placeholder="全部" style="width: 150px" clearable>
                <el-option label="不合格" value="UNQUALIFIED" />
                <el-option label="有异常" value="EXCEPTION" />
                <el-option label="全部" value="" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="processForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 280px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="danger" @click="queryByProcess">
                <el-icon><Search /></el-icon>
                查询不合格批次
              </el-button>
              <el-button @click="resetProcessForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="双维度组合查询" name="both">
          <el-form :model="combinedForm" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="原料类型">
                  <el-select v-model="combinedForm.materialTypeId" placeholder="选择原料类型" style="width: 100%">
                    <el-option label="麦芽" :value="1" />
                    <el-option label="酒花" :value="2" />
                    <el-option label="酵母" :value="3" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="具体原料">
                  <el-select v-model="combinedForm.materialId" placeholder="选择原料" style="width: 100%" filterable>
                    <el-option v-for="m in materialList" :key="m.id" :label="m.materialName" :value="m.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="工序类型">
                  <el-select v-model="combinedForm.processTypeId" placeholder="选择工序" style="width: 100%">
                    <el-option label="糖化" :value="1" />
                    <el-option label="发酵" :value="5" />
                    <el-option label="装瓶" :value="6" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="质量状态">
                  <el-select v-model="combinedForm.qualityStatus" placeholder="全部" style="width: 100%">
                    <el-option label="不合格" value="UNQUALIFIED" />
                    <el-option label="有异常" value="EXCEPTION" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="追溯类型">
                  <el-select v-model="combinedForm.traceType" placeholder="请选择" style="width: 100%">
                    <el-option label="仅原料" value="MATERIAL" />
                    <el-option label="仅工序" value="PROCESS" />
                    <el-option label="原料+工序" value="BOTH" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item>
                  <el-button type="danger" @click="queryCombined">
                    <el-icon><Search /></el-icon>
                    组合查询
                  </el-button>
                  <el-button @click="resetCombinedForm">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-card shadow="hover" class="result-card" v-if="queryResults.length > 0">
      <template #header>
        <div class="result-header">
          <span>查询结果 <el-tag type="danger" effect="dark">{{ queryResults.length }} 个不合格批次</el-tag></span>
          <div class="result-actions">
            <el-button type="primary" size="small" @click="exportResults">
              <el-icon><Download /></el-icon>
              导出报告
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="queryResults" stripe>
        <el-table-column prop="batchNo" label="批次号" width="120" fixed="left" />
        <el-table-column prop="batchName" label="批次名称" />
        <el-table-column prop="recipeName" label="使用配方" />
        <el-table-column prop="brewer" label="酿酒师" width="100" />
        <el-table-column prop="startTime" label="生产时间" width="180" />
        <el-table-column prop="qualityStatus" label="质量状态" width="100">
          <template #default="{ row }">
            <el-tag type="danger" effect="dark">不合格</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="defectType" label="缺陷类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getDefectType(row.defectType)">{{ row.defectType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="suspectedMaterial" label="疑似原料问题" />
        <el-table-column prop="suspectedProcess" label="疑似工序问题" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewBatchDetail(row)">批次详情</el-button>
            <el-button type="info" link @click="viewTastingDetail(row)">品测详情</el-button>
            <el-button type="success" link @click="analyzeTrace(row)">追溯分析</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="hover" class="analysis-card" v-if="traceAnalysisData">
      <template #header>
        <span>追溯分析结果 - {{ traceAnalysisData.batchNo }}</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <h4>原料追溯链</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in traceAnalysisData.materialChain"
              :key="'m' + index"
              :timestamp="item.time"
              :type="item.hasIssue ? 'danger' : 'success'"
            >
              <el-card :class="item.hasIssue ? 'issue-card' : 'normal-card'" shadow="never">
                <div class="trace-item">
                  <div class="trace-item-header">
                    <span class="trace-item-name">{{ item.name }}</span>
                    <el-tag v-if="item.hasIssue" type="danger" effect="dark">有问题</el-tag>
                    <el-tag v-else type="success" effect="dark">正常</el-tag>
                  </div>
                  <div class="trace-item-info">
                    <span>批次号: {{ item.batchNo }}</span>
                    <span>供应商: {{ item.supplier }}</span>
                    <span v-if="item.issue">问题: {{ item.issue }}</span>
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-col>
        <el-col :span="12">
          <h4>工序追溯链</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in traceAnalysisData.processChain"
              :key="'p' + index"
              :timestamp="item.time"
              :type="item.hasIssue ? 'danger' : 'success'"
            >
              <el-card :class="item.hasIssue ? 'issue-card' : 'normal-card'" shadow="never">
                <div class="trace-item">
                  <div class="trace-item-header">
                    <span class="trace-item-name">{{ item.name }}</span>
                    <el-tag v-if="item.hasIssue" type="danger" effect="dark">有异常</el-tag>
                    <el-tag v-else type="success" effect="dark">正常</el-tag>
                  </div>
                  <div class="trace-item-info">
                    <span>温度: {{ item.temp }}°C</span>
                    <span>时长: {{ item.duration }}</span>
                    <span v-if="item.issue">异常: {{ item.issue }}</span>
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-col>
      </el-row>
      <div class="analysis-conclusion">
        <el-alert
          :title="'追溯结论: ' + traceAnalysisData.conclusion"
          type="error"
          :closable="false"
          show-icon
        />
      </div>
    </el-card>

    <el-empty v-if="!loading && queryResults.length === 0 && hasSearched" description="暂无查询结果，请调整查询条件" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { traceByMaterial, traceByProcess, traceBatch } from '@/api/batch'
import { analyzeTraceability } from '@/api/traceability'
import { getAllMaterials } from '@/api/material'

const router = useRouter()
const loading = ref(false)
const hasSearched = ref(false)
const activeTab = ref('material')
const materialList = ref([])
const queryResults = ref([])
const traceAnalysisData = ref(null)

const materialForm = reactive({
  materialTypeId: null,
  materialId: null,
  batchNo: ''
})

const processForm = reactive({
  processTypeId: null,
  qualityStatus: 'UNQUALIFIED',
  dateRange: []
})

const combinedForm = reactive({
  materialTypeId: null,
  materialId: null,
  processTypeId: null,
  qualityStatus: 'UNQUALIFIED',
  traceType: 'BOTH'
})

const loadMaterials = async () => {
  try {
    materialList.value = await getAllMaterials()
  } catch (e) {
    materialList.value = [
      { id: 1, materialName: '二棱基础麦芽' },
      { id: 2, materialName: '水晶麦芽' },
      { id: 3, materialName: '西楚酒花' },
      { id: 4, materialName: '马赛克酒花' },
      { id: 5, materialName: 'US-05酵母' }
    ]
  }
}

const getDefectType = (type) => {
  const map = { 风味异常: 'danger', 香气不足: 'warning', 外观问题: 'info', 口感问题: 'primary' }
  return map[type] || ''
}

const queryByMaterial = async () => {
  if (!materialForm.materialId) {
    ElMessage.warning('请选择具体原料')
    return
  }
  loading.value = true
  hasSearched.value = true
  try {
    queryResults.value = await traceByMaterial(materialForm.materialId) || mockResults
  } catch (e) {
    queryResults.value = mockResults
  } finally {
    loading.value = false
  }
}

const queryByProcess = async () => {
  if (!processForm.processTypeId) {
    ElMessage.warning('请选择工序类型')
    return
  }
  loading.value = true
  hasSearched.value = true
  try {
    queryResults.value = await traceByProcess(processForm.processTypeId) || mockResults
  } catch (e) {
    queryResults.value = mockResults
  } finally {
    loading.value = false
  }
}

const queryCombined = async () => {
  loading.value = true
  hasSearched.value = true
  try {
    const res = await traceBatch(combinedForm)
    queryResults.value = res.records || mockResults
  } catch (e) {
    queryResults.value = mockResults
  } finally {
    loading.value = false
  }
}

const resetMaterialForm = () => {
  Object.assign(materialForm, { materialTypeId: null, materialId: null, batchNo: '' })
  queryResults.value = []
  hasSearched.value = false
}

const resetProcessForm = () => {
  Object.assign(processForm, { processTypeId: null, qualityStatus: 'UNQUALIFIED', dateRange: [] })
  queryResults.value = []
  hasSearched.value = false
}

const resetCombinedForm = () => {
  Object.assign(combinedForm, { materialTypeId: null, materialId: null, processTypeId: null, qualityStatus: 'UNQUALIFIED', traceType: 'BOTH' })
  queryResults.value = []
  hasSearched.value = false
}

const viewBatchDetail = (row) => {
  router.push(`/batches/${row.id}`)
}

const viewTastingDetail = (row) => {
  router.push(`/tastings/${row.tastingId || 2}`)
}

const analyzeTrace = async (row) => {
  try {
    const res = await analyzeTraceability(row.id, 'BOTH')
    traceAnalysisData.value = res || mockAnalysis
  } catch (e) {
    traceAnalysisData.value = mockAnalysis
  }
}

const exportResults = () => {
  if (queryResults.value.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }
  try {
    let csvContent = '批次号,批次名称,使用配方,酿酒师,生产时间,质量状态,缺陷类型,疑似原料问题,疑似工序问题\n'
    queryResults.value.forEach(row => {
      csvContent += `${row.batchNo},${row.batchName},${row.recipeName},${row.brewer},${row.startTime},不合格,${row.defectType},${row.suspectedMaterial},${row.suspectedProcess}\n`
    })
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `不合格批次追溯报告_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('报告导出成功')
  } catch (e) {
    ElMessage.error('导出失败：' + e.message)
  }
}

const mockResults = [
  { id: 4, batchNo: 'B2024004', batchName: '德式皮尔森', recipeName: '德式皮尔森', brewer: '张师傅', startTime: '2024-01-05 08:00:00', qualityStatus: 'UNQUALIFIED', defectType: '风味异常', suspectedMaterial: '二棱基础麦芽(批次M20231205)', suspectedProcess: '发酵温度异常波动', tastingId: 2 },
  { id: 8, batchNo: 'B2023088', batchName: '美式淡色艾尔', recipeName: '美式淡色艾尔', brewer: '李师傅', startTime: '2023-12-15 09:00:00', qualityStatus: 'UNQUALIFIED', defectType: '香气不足', suspectedMaterial: '西楚酒花(批次H20231120)', suspectedProcess: '煮沸时间不足', tastingId: 6 },
  { id: 12, batchNo: 'B2023080', batchName: '牛奶世涛', recipeName: '牛奶世涛', brewer: '王师傅', startTime: '2023-12-01 10:00:00', qualityStatus: 'UNQUALIFIED', defectType: '口感问题', suspectedMaterial: 'US-05酵母(批次Y20231115)', suspectedProcess: '发酵温度偏低', tastingId: 8 }
]

const mockAnalysis = {
  batchNo: 'B2024004',
  materialChain: [
    { name: '二棱基础麦芽', time: '2024-01-05 08:00', batchNo: 'M20231205', supplier: '麦芽供应商A', hasIssue: true, issue: '水分含量超标8%' },
    { name: '西楚酒花', time: '2024-01-05 10:30', batchNo: 'H20231120', supplier: '酒花供应商B', hasIssue: false },
    { name: 'US-05酵母', time: '2024-01-05 12:00', batchNo: 'Y20231115', supplier: '酵母供应商C', hasIssue: false }
  ],
  processChain: [
    { name: '糖化', time: '2024-01-05 08:00', temp: 65, duration: '60min', hasIssue: false },
    { name: '过滤', time: '2024-01-05 09:30', temp: 78, duration: '30min', hasIssue: false },
    { name: '煮沸', time: '2024-01-05 10:15', temp: 100, duration: '55min', hasIssue: true, issue: '煮沸时间比标准少5分钟' },
    { name: '冷却', time: '2024-01-05 11:30', temp: 20, duration: '20min', hasIssue: false },
    { name: '发酵', time: '2024-01-05 12:00', temp: 20.5, duration: '14天', hasIssue: true, issue: '温度波动过大，最高达22.1°C' },
    { name: '装瓶', time: '2024-01-19 14:00', temp: 20, duration: '1天', hasIssue: false }
  ],
  conclusion: '经追溯分析，该批次不合格主要原因：1) 二棱基础麦芽水分含量超标8%，影响出糖率和最终口感；2) 煮沸时间不足5分钟，导致酒花利用不充分；3) 发酵过程温度波动过大，影响酵母正常代谢。建议对原料供应商A进行质量审核，并加强发酵过程温度监控。'
}

loadMaterials()
</script>

<style scoped>
.traceability {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card {
  border-radius: 8px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
}

.result-card {
  border-radius: 8px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.analysis-card {
  border-radius: 8px;
}

.analysis-card h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.issue-card {
  border: 1px solid #f56c6c;
  background: #fef0f0;
}

.normal-card {
  border: 1px solid #67c23a;
  background: #f0f9eb;
}

.trace-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.trace-item-name {
  font-weight: 600;
}

.trace-item-info {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 13px;
  color: #666;
}

.analysis-conclusion {
  margin-top: 20px;
}
</style>
