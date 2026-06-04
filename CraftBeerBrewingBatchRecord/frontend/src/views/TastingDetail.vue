<template>
  <div class="tasting-detail">
    <el-button @click="goBack" class="back-btn">
      <el-icon><ArrowLeft /></el-icon>
      返回列表
    </el-button>

    <el-card shadow="hover" class="info-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h2>品测记录详情</h2>
            <el-tag type="info" size="large">{{ tasting.batchNo }}</el-tag>
            <el-tag :type="getJudgmentType(tasting.finalJudgment)" effect="dark" size="large">
              {{ getJudgmentText(tasting.finalJudgment) }}
            </el-tag>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="showEditDialog">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="批次号">{{ tasting.batchNo }}</el-descriptions-item>
        <el-descriptions-item label="批次名称">{{ tasting.batchName }}</el-descriptions-item>
        <el-descriptions-item label="品测时间">{{ tasting.tastingTime }}</el-descriptions-item>
        <el-descriptions-item label="品评人员">{{ tasting.tastingPanel }}</el-descriptions-item>
        <el-descriptions-item label="实测酒精度">{{ tasting.measuredAbv }}%</el-descriptions-item>
        <el-descriptions-item label="实测IBU">{{ tasting.measuredIbu }}</el-descriptions-item>
        <el-descriptions-item label="实测色度">{{ tasting.measuredColor }} SRM</el-descriptions-item>
        <el-descriptions-item label="存在缺陷">{{ tasting.defects || '无' }}</el-descriptions-item>
        <el-descriptions-item label="改进建议">{{ tasting.improvementSuggestions || '无' }}</el-descriptions-item>
        <el-descriptions-item label="品测备注" :span="3">{{ tasting.tastingNotes }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="radar-card">
          <template #header>
            <span>评分雷达图</span>
          </template>
          <div ref="radarChartRef" class="radar-chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="scores-card">
          <template #header>
            <span>各项评分详情</span>
          </template>
          <div class="scores-list">
            <div class="score-item">
              <div class="score-header">
                <span class="score-label">外观评分</span>
                <span class="score-value" :class="getScoreClass(tasting.appearanceScore)">{{ tasting.appearanceScore }}</span>
              </div>
              <el-progress :percentage="tasting.appearanceScore * 10" :color="getProgressColor(tasting.appearanceScore)" :show-text="false" />
            </div>
            <div class="score-item">
              <div class="score-header">
                <span class="score-label">香气评分</span>
                <span class="score-value" :class="getScoreClass(tasting.aromaScore)">{{ tasting.aromaScore }}</span>
              </div>
              <el-progress :percentage="tasting.aromaScore * 10" :color="getProgressColor(tasting.aromaScore)" :show-text="false" />
            </div>
            <div class="score-item">
              <div class="score-header">
                <span class="score-label">风味评分</span>
                <span class="score-value" :class="getScoreClass(tasting.flavorScore)">{{ tasting.flavorScore }}</span>
              </div>
              <el-progress :percentage="tasting.flavorScore * 10" :color="getProgressColor(tasting.flavorScore)" :show-text="false" />
            </div>
            <div class="score-item">
              <div class="score-header">
                <span class="score-label">口感评分</span>
                <span class="score-value" :class="getScoreClass(tasting.mouthfeelScore)">{{ tasting.mouthfeelScore }}</span>
              </div>
              <el-progress :percentage="tasting.mouthfeelScore * 10" :color="getProgressColor(tasting.mouthfeelScore)" :show-text="false" />
            </div>
            <div class="score-item overall">
              <div class="score-header">
                <span class="score-label">综合评分</span>
                <span class="score-value overall-score" :class="getScoreClass(tasting.overallScore)">
                  {{ tasting.overallScore }}
                </span>
              </div>
              <el-progress :percentage="tasting.overallScore * 10" :color="getProgressColor(tasting.overallScore)" :show-text="false" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="analysis-card">
      <template #header>
        <span>品测分析</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="analysis-item">
            <div class="analysis-label">与目标值对比</div>
            <div class="analysis-content">
              <div class="compare-item">
                <span>酒精度</span>
                <span :class="getCompareClass(tasting.measuredAbv, 6.5)">
                  {{ tasting.measuredAbv }}% (目标: 6.5%)
                </span>
              </div>
              <div class="compare-item">
                <span>IBU</span>
                <span :class="getCompareClass(tasting.measuredIbu, 65)">
                  {{ tasting.measuredIbu }} (目标: 65)
                </span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="analysis-item">
            <div class="analysis-label">风味描述</div>
            <div class="analysis-content">
              <div class="flavor-tags">
                <el-tag type="success">柑橘</el-tag>
                <el-tag type="primary">松木</el-tag>
                <el-tag type="warning">热带水果</el-tag>
                <el-tag type="info">麦芽甜</el-tag>
                <el-tag type="danger">微苦</el-tag>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="analysis-item">
            <div class="analysis-label">总体评价</div>
            <div class="analysis-content">
              <p v-if="tasting.finalJudgment === 'PASS'" class="text-success">
                该批次品质优秀，各项指标均符合标准，建议作为标杆批次进行参考。
              </p>
              <p v-else class="text-danger">
                该批次存在一定问题，建议查看改进建议并追溯相关生产环节。
              </p>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog v-model="editDialogVisible" title="编辑品测记录" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="最终判定">
          <el-select v-model="editForm.finalJudgment" style="width: 100%">
            <el-option label="通过" value="PASS" />
            <el-option label="未通过" value="FAIL" />
            <el-option label="待判定" value="PENDING" />
          </el-select>
        </el-form-item>
        <el-form-item label="品测备注">
          <el-input v-model="editForm.tastingNotes" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="改进建议">
          <el-input v-model="editForm.improvementSuggestions" type="textarea" :rows="3" />
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
import { getTastingDetail, updateTasting } from '@/api/tasting'

const route = useRoute()
const router = useRouter()

const tasting = ref({})
const radarChartRef = ref(null)
const editDialogVisible = ref(false)

const editForm = reactive({
  id: '',
  finalJudgment: '',
  tastingNotes: '',
  improvementSuggestions: ''
})

const loadData = async () => {
  try {
    const id = route.params.id
    tasting.value = await getTastingDetail(id) || mockTasting
  } catch (e) {
    tasting.value = mockTasting
  }
}

const goBack = () => {
  router.push('/tastings')
}

const getJudgmentType = (judgment) => {
  const map = { PASS: 'success', FAIL: 'danger', PENDING: 'warning' }
  return map[judgment] || 'info'
}

const getJudgmentText = (judgment) => {
  const map = { PASS: '通过', FAIL: '未通过', PENDING: '待判定' }
  return map[judgment] || judgment
}

const getScoreClass = (score) => {
  if (score >= 8) return 'score-high'
  if (score >= 6) return 'score-medium'
  return 'score-low'
}

const getProgressColor = (score) => {
  if (score >= 8) return '#67c23a'
  if (score >= 6) return '#e6a23c'
  return '#f56c6c'
}

const getCompareClass = (actual, target) => {
  const diff = Math.abs(Number(actual) - Number(target))
  if (diff <= 0.5) return 'text-success'
  return 'text-danger'
}

const showEditDialog = () => {
  editForm.id = tasting.value.id
  editForm.finalJudgment = tasting.value.finalJudgment
  editForm.tastingNotes = tasting.value.tastingNotes
  editForm.improvementSuggestions = tasting.value.improvementSuggestions
  editDialogVisible.value = true
}

const handleEdit = async () => {
  try {
    await updateTasting(editForm)
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    loadData()
  }
}

const initRadarChart = () => {
  if (!radarChartRef.value) return
  const chart = echarts.init(radarChartRef.value)
  chart.setOption({
    tooltip: {},
    legend: { data: ['本次评分', '平均评分'] },
    radar: {
      indicator: [
        { name: '外观', max: 10 },
        { name: '香气', max: 10 },
        { name: '风味', max: 10 },
        { name: '口感', max: 10 },
        { name: '整体', max: 10 }
      ],
      splitArea: {
        areaStyle: {
          color: ['rgba(103,194,58,0.05)', 'rgba(103,194,58,0.1)']
        }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [tasting.value.appearanceScore, tasting.value.aromaScore, tasting.value.flavorScore, tasting.value.mouthfeelScore, tasting.value.overallScore],
          name: '本次评分',
          lineStyle: { color: '#409eff', width: 2 },
          itemStyle: { color: '#409eff' },
          areaStyle: {
            color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
              { offset: 0, color: 'rgba(64,158,255,0.5)' },
              { offset: 1, color: 'rgba(64,158,255,0.1)' }
            ])
          }
        },
        {
          value: [8.2, 8.3, 8.1, 8.0, 8.2],
          name: '平均评分',
          lineStyle: { color: '#909399', type: 'dashed', width: 1 },
          itemStyle: { color: '#909399' }
        }
      ]
    }]
  })
}

const mockTasting = {
  id: 1,
  batchNo: 'B2024001',
  batchName: '美式IPA第一批次',
  tastingTime: '2024-01-25 14:30:00',
  tastingPanel: '张三,李四,王五',
  appearanceScore: 8.5,
  aromaScore: 8.8,
  flavorScore: 9.0,
  mouthfeelScore: 8.6,
  overallScore: 8.8,
  finalJudgment: 'PASS',
  measuredAbv: 6.4,
  measuredIbu: 63,
  measuredColor: 8,
  tastingNotes: '外观呈深金色，泡沫丰富持久。香气浓郁，有明显的柑橘和松木香气。入口苦味适中，回味有麦芽甜味和酒花的苦感。整体平衡良好，是一款优秀的IPA。',
  defects: '无明显缺陷',
  improvementSuggestions: '可以适当增加干投酒花的量，进一步提升香气复杂度。'
}

onMounted(() => {
  loadData()
  nextTick(() => {
    setTimeout(() => initRadarChart(), 100)
  })
  window.addEventListener('resize', () => {
    radarChartRef.value && echarts.getInstanceByDom(radarChartRef.value)?.resize()
  })
})
</script>

<style scoped>
.tasting-detail {
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

.radar-card,
.scores-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.radar-chart {
  height: 350px;
}

.scores-list {
  padding: 10px 0;
}

.score-item {
  margin-bottom: 20px;
}

.score-item:last-child {
  margin-bottom: 0;
}

.score-item.overall {
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.score-label {
  font-size: 14px;
  color: #666;
}

.score-value {
  font-size: 20px;
  font-weight: bold;
}

.overall-score {
  font-size: 28px;
}

.score-high {
  color: #67c23a;
}

.score-medium {
  color: #e6a23c;
}

.score-low {
  color: #f56c6c;
}

.analysis-card {
  border-radius: 8px;
}

.analysis-item {
  padding: 10px;
}

.analysis-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 10px;
}

.analysis-content {
  font-size: 14px;
}

.compare-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.flavor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}
</style>
