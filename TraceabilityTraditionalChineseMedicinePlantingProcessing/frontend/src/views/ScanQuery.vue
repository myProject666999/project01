<template>
  <div class="scan-query">
    <div class="query-container" v-if="!loading">
      <div class="header">
        <h1>中药材溯源查询</h1>
        <p class="subtitle">扫码查询中药材全流程溯源信息</p>
      </div>
      <div v-if="traceData" class="trace-content">
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in timelineItems"
            :key="index"
            :timestamp="item.time"
            :type="item.type"
            :hollow="item.hollow"
          >
            <el-card shadow="hover" class="timeline-card">
              <h4>{{ item.title }}</h4>
              <p v-for="(value, key) in item.data" :key="key" class="item-detail">
                <span class="label">{{ key }}:</span>
                <span class="value">{{ value }}</span>
              </p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      <el-empty v-else description="暂无溯源数据" />
    </div>
    <div v-else class="loading-container">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>正在查询溯源信息...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { getTraceabilityByQRCode } from '@/api/modules/scan'

const route = useRoute()
const loading = ref(true)
const traceData = ref(null)

const timelineItems = computed(() => {
  if (!traceData.value) return []
  const items = []

  if (traceData.value.plot) {
    items.push({
      time: traceData.value.plot.created_at || '种植阶段',
      title: '地块信息',
      type: 'primary',
      data: {
        '地块名称': traceData.value.plot.name,
        '地块面积': traceData.value.plot.area + ' 亩',
        '土壤类型': traceData.value.plot.soil_type,
        '位置': traceData.value.plot.location
      }
    })
  }

  if (traceData.value.farming_records?.length) {
    traceData.value.farming_records.forEach(record => {
      items.push({
        time: record.operation_date,
        title: record.operation_type_name || '农事操作',
        type: 'success',
        data: {
          '操作内容': record.content,
          '操作人员': record.operator_name,
          '投入品': record.input_name || '无'
        }
      })
    })
  }

  if (traceData.value.harvest_batch) {
    items.push({
      time: traceData.value.harvest_batch.harvest_date,
      title: '采收信息',
      type: 'warning',
      data: {
        '批次号': traceData.value.harvest_batch.batch_no,
        '采收重量': traceData.value.harvest_batch.weight + ' kg',
        '采收人员': traceData.value.harvest_batch.operator_name
      }
    })
  }

  if (traceData.value.processing_records?.length) {
    traceData.value.processing_records.forEach(record => {
      items.push({
        time: record.process_date,
        title: record.step_name || '加工步骤',
        type: 'info',
        data: {
          '加工内容': record.content,
          '操作人员': record.operator_name,
          '设备': record.equipment || '无'
        }
      })
    })
  }

  if (traceData.value.product) {
    items.push({
      time: traceData.value.product.created_at,
      title: '成品信息',
      type: 'danger',
      hollow: true,
      data: {
        '产品名称': traceData.value.product.name,
        '规格': traceData.value.product.specification,
        '保质期': traceData.value.product.shelf_life,
        '检测状态': traceData.value.product.inspection_passed ? '合格' : '未检测'
      }
    })
  }

  return items
})

async function loadTraceData() {
  loading.value = true
  try {
    const code = route.params.code
    traceData.value = await getTraceabilityByQRCode(code)
  } catch (error) {
    ElMessage.error(error.message || '查询失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTraceData()
})
</script>

<style scoped>
.scan-query {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.query-container {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  text-align: center;
  color: #fff;
  padding: 30px 0;
}

.header h1 {
  font-size: 28px;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.trace-content {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
}

.timeline-card {
  margin-bottom: 10px;
}

.timeline-card h4 {
  margin-bottom: 12px;
  color: #303133;
}

.item-detail {
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
  display: flex;
}

.item-detail .label {
  color: #909399;
  width: 80px;
  flex-shrink: 0;
}

.item-detail .value {
  color: #303133;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #fff;
}

.loading-container p {
  margin-top: 16px;
  font-size: 14px;
}
</style>
