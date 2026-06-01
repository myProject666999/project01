<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <el-button :icon="ArrowLeft" @click="goBack" style="margin-right: 15px;">返回</el-button>
        <h2 class="page-title" style="display: inline-block;">
          逐年转化曲线
          <span v-if="teaProduct" style="font-size: 16px; color: #909399; margin-left: 10px;">
            {{ teaProduct.product_name }} ({{ teaProduct.production_year }})
          </span>
        </h2>
      </div>
    </div>

    <div v-if="teaProduct" class="chart-container">
      <el-descriptions :column="4" border style="margin-bottom: 20px;">
        <el-descriptions-item label="产区">{{ teaProduct.origin }}</el-descriptions-item>
        <el-descriptions-item label="原料">{{ teaProduct.material_type === 'pure' ? '纯料' : '拼配' }}</el-descriptions-item>
        <el-descriptions-item label="形态">
          {{ shapeMap[teaProduct.shape] }} {{ teaProduct.specification }}g
        </el-descriptions-item>
        <el-descriptions-item label="山头/香型">
          {{ teaProduct.mountain }} / {{ teaProduct.fragrance_type }}
        </el-descriptions-item>
      </el-descriptions>
      
      <div v-if="curveData.length > 0">
        <h3 style="margin-bottom: 20px;">评分转化趋势</h3>
        <div ref="scoreChart" style="height: 400px;"></div>
      </div>
    </div>

    <div v-if="curveData.length > 0" class="chart-container" style="margin-top: 20px;">
      <h3 style="margin-bottom: 20px;">逐年品鉴记录</h3>
      
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in curveData"
          :key="item.id"
          :timestamp="item.tasting_date"
          placement="top"
        >
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>
                  <el-tag :type="getScoreType(item.overall_score)" size="large" style="margin-right: 10px;">
                    {{ item.year }}年
                  </el-tag>
                  综合评分：
                  <span style="font-size: 20px; font-weight: 600; color: #409eff;">
                    {{ item.overall_score }}
                  </span>
                  <span style="color: #909399; margin-left: 20px;">
                    平均单泡评分：{{ item.avg_infusion_score }}
                  </span>
                </span>
                <span style="color: #909399; font-size: 14px;">
                  {{ item.tea_weight }}g / {{ item.water_type === 'pure' ? '纯净水' : '矿泉水' }} / {{ item.brew_count }}泡
                </span>
              </div>
            </template>
            
            <div style="margin-bottom: 15px;">
              <strong>评价：</strong>{{ item.notes }}
            </div>
            
            <el-divider content-position="left">各泡详情</el-divider>
            
            <div ref="infusionChart" :id="'infusionChart-' + index" style="height: 250px; margin-bottom: 15px;"></div>
            
            <el-row :gutter="12">
              <el-col :span="8" v-for="infusion in item.infusions" :key="infusion.infusion_number">
                <div class="infusion-item" style="background: #f5f7fa; padding: 12px; border-radius: 8px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span class="infusion-number">第{{ infusion.infusion_number }}泡</span>
                    <el-tag :type="getScoreType(infusion.score)" size="small">{{ infusion.score }}</el-tag>
                  </div>
                  <div style="font-size: 13px; color: #606266; margin-bottom: 5px;">
                    <strong>汤色：</strong>{{ infusion.soup_color }}
                  </div>
                  <div style="font-size: 13px; color: #606266; margin-bottom: 5px;">
                    <strong>香气：</strong>{{ infusion.aroma }}
                  </div>
                  <div style="font-size: 13px; color: #606266;">
                    <strong>滋味：</strong>{{ infusion.taste }}
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>

    <el-empty v-if="curveData.length === 0 && !loading" description="暂无品鉴记录，请先添加品鉴笔记" />
    
    <div v-loading="loading" style="min-height: 200px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getConversionCurve } from '../api/tastingNotes'

const route = useRoute()
const router = useRouter()

const scoreChart = ref(null)
const loading = ref(false)
const teaProduct = ref(null)
const curveData = ref([])

const shapeMap = {
  cake: '饼茶',
  brick: '砖茶',
  tuo: '沱茶',
  loose: '散茶'
}

const getScoreType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'warning'
  return 'info'
}

const goBack = () => {
  router.back()
}

const initScoreChart = () => {
  if (!scoreChart.value || curveData.value.length === 0) return
  
  const chart = echarts.init(scoreChart.value)
  
  const years = curveData.value.map(item => item.year + '年')
  const overallScores = curveData.value.map(item => parseFloat(item.overall_score))
  const avgScores = curveData.value.map(item => parseFloat(item.avg_infusion_score))
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['综合评分', '平均单泡评分']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: years
    },
    yAxis: {
      type: 'value',
      min: 70,
      max: 100,
      name: '评分'
    },
    series: [
      {
        name: '综合评分',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 12,
        itemStyle: { color: '#409eff' },
        lineStyle: { color: '#409eff', width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.4)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 14,
          fontWeight: 'bold'
        },
        data: overallScores
      },
      {
        name: '平均单泡评分',
        type: 'line',
        smooth: true,
        symbol: 'diamond',
        symbolSize: 10,
        itemStyle: { color: '#67c23a' },
        lineStyle: { color: '#67c23a', width: 2, type: 'dashed' },
        data: avgScores
      }
    ]
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}

const initInfusionCharts = () => {
  curveData.value.forEach((item, index) => {
    nextTick(() => {
      const chartDom = document.getElementById('infusionChart-' + index)
      if (!chartDom || !item.infusions || item.infusions.length === 0) return
      
      const chart = echarts.init(chartDom)
      
      const infusionNumbers = item.infusions.map(inf => '第' + inf.infusion_number + '泡')
      const scores = item.infusions.map(inf => parseFloat(inf.score))
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            const data = item.infusions[params[0].dataIndex]
            return `
              <div style="padding: 5px;">
                <div><strong>${params[0].name}</strong></div>
                <div>评分：${params[0].value}</div>
                <div>汤色：${data.soup_color}</div>
                <div>香气：${data.aroma}</div>
                <div>滋味：${data.taste}</div>
              </div>
            `
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: infusionNumbers,
          axisLabel: { fontSize: 12 }
        },
        yAxis: {
          type: 'value',
          min: 70,
          max: 100,
          name: '评分'
        },
        series: [{
          type: 'bar',
          data: scores,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ]),
            borderRadius: [4, 4, 0, 0]
          },
          label: {
            show: true,
            position: 'top'
          }
        }]
      }
      
      chart.setOption(option)
      
      window.addEventListener('resize', () => {
        chart.resize()
      })
    })
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const teaProductId = route.params.id
    const res = await getConversionCurve(teaProductId)
    
    teaProduct.value = res.data.tea_product
    curveData.value = res.data.curve_data
    
    await nextTick()
    initScoreChart()
    initInfusionCharts()
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, () => {
  loadData()
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}
</style>
