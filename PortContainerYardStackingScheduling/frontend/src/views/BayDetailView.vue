<template>
  <div class="bay-detail-view">
    <div class="page-header">
      <el-button @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon>返回全景
      </el-button>
      <h2>{{ zoneName }} - Bay {{ bay }}</h2>
      <el-tag :type="zoneType === 'dangerous' ? 'danger' : 'primary'" effect="dark">
        {{ zoneType === 'dangerous' ? '危险品区' : '普通箱区' }}
      </el-tag>
    </div>

    <el-row :gutter="16">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>堆位详情</span>
              <div class="stats-inline">
                <el-tag type="success">{{ bayStats.empty }} 空闲</el-tag>
                <el-tag type="warning">{{ bayStats.occupied }} 占用</el-tag>
                <el-tag>利用率 {{ bayStats.utilization }}%</el-tag>
              </div>
            </div>
          </template>
          <div class="stack-grid">
            <div class="tier-labels">
              <div v-for="t in tiers" :key="t" class="tier-label">T{{ t }}</div>
            </div>
            <div v-for="r in rows" :key="r" class="stack-column">
              <div class="row-label">R{{ r }}</div>
              <div v-for="t in tiers" :key="t" class="stack-cell" :class="cellClass(r, t)" @click="clickCell(r, t)">
                <template v-if="getCell(r, t) && getCell(r, t).status === 'occupied'">
                  <div class="cell-no">{{ formatNo(getCell(r, t)) }}</div>
                  <div class="cell-type">{{ getCell(r, t).container && getCell(r, t).container.size_type }}</div>
                </template>
                <template v-else>
                  <div class="cell-empty-text">空</div>
                </template>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never" v-if="selectedSlot">
          <template #header><span>槽位信息</span></template>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="位置">Bay {{ bay }} - Row {{ selectedSlot.row }} - Tier {{ selectedSlot.tier }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="selectedSlot.status === 'occupied' ? 'warning' : 'success'" size="small">
                {{ selectedSlot.status === 'occupied' ? '已占用' : '空闲' }}
              </el-tag>
            </el-descriptions-item>
            <template v-if="selectedSlot.container">
              <el-descriptions-item label="箱号">{{ selectedSlot.container.container_no }}</el-descriptions-item>
              <el-descriptions-item label="箱型">{{ selectedSlot.container.size_type }}</el-descriptions-item>
              <el-descriptions-item label="重量">{{ selectedSlot.container.weight_kg }} kg</el-descriptions-item>
              <el-descriptions-item label="危险品">
                <el-tag v-if="selectedSlot.container.is_dangerous" type="danger" size="small">IMO {{ selectedSlot.container.imo_class }}</el-tag>
                <span v-else>否</span>
              </el-descriptions-item>
              <el-descriptions-item label="进场时间">{{ formatTime(selectedSlot.container.arrival_time) }}</el-descriptions-item>
              <el-descriptions-item label="预计出场">{{ selectedSlot.container.departure_time ? formatTime(selectedSlot.container.departure_time) : '-' }}</el-descriptions-item>
            </template>
          </el-descriptions>
        </el-card>

        <el-card shadow="never" style="margin-top: 16px;">
          <template #header><span>该Bay统计</span></template>
          <el-progress :percentage="parseFloat(bayStats.utilization)" :color="progressColor" :stroke-width="20" :text-inside="true" />
          <div class="stat-row" style="margin-top: 12px;">
            <span>总槽位: {{ bayStats.total }}</span>
            <span>已占: {{ bayStats.occupied }}</span>
            <span>空闲: {{ bayStats.empty }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getBayDetail } from '../api'

const route = useRoute()
const zoneId = computed(() => Number(route.params.zoneId))
const bay = computed(() => Number(route.params.bay))

const bayData = ref(null)
const selectedSlot = ref(null)
const zoneName = ref('')
const zoneType = ref('')
const rows = 6
const tiers = 5

const bayStats = computed(() => bayData.value ? bayData.value.stats : { total: 0, occupied: 0, empty: 0, utilization: '0' })

const progressColor = computed(() => {
  const u = parseFloat(bayStats.value.utilization)
  if (u > 80) return '#F56C6C'
  if (u > 60) return '#E6A23C'
  return '#67C23A'
})

function getCell(r, t) {
  if (!bayData.value || !bayData.value.slots) return null
  return bayData.value.slots[r] && bayData.value.slots[r][t] ? bayData.value.slots[r][t] : null
}

function cellClass(r, t) {
  const cell = getCell(r, t)
  if (!cell) return 'cell-missing'
  if (cell.status === 'occupied') {
    if (cell.container && cell.container.is_dangerous) return 'cell-dangerous'
    return 'cell-occupied'
  }
  return 'cell-empty-slot'
}

function clickCell(r, t) {
  const cell = getCell(r, t)
  if (cell) selectedSlot.value = cell
}

function formatNo(cell) {
  if (!cell.container_no) return ''
  if (cell.container_no.length > 7) return cell.container_no.slice(-7)
  return cell.container_no
}

function formatTime(t) {
  if (!t) return '-'
  return t.replace('T', ' ').substring(0, 16)
}

async function loadBay() {
  try {
    const res = await getBayDetail(zoneId.value, bay.value)
    bayData.value = res.data
    zoneName.value = res.data.zone_code || ''
    zoneType.value = res.data.zone_type || 'normal'
  } catch (e) {
    ElMessage.error('加载Bay数据失败')
  }
}

onMounted(loadBay)
watch([zoneId, bay], loadBay)
</script>

<style scoped>
.bay-detail-view { max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.page-header h2 { font-size: 20px; color: #303133; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.stats-inline { display: flex; gap: 8px; }
.stack-grid { display: flex; gap: 4px; overflow-x: auto; }
.tier-labels { display: flex; flex-direction: column; gap: 4px; }
.tier-label { width: 30px; height: 60px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #909399; font-weight: 600; }
.stack-column { display: flex; flex-direction: column; gap: 4px; align-items: center; }
.row-label { font-size: 12px; color: #909399; font-weight: 600; margin-bottom: 2px; }
.stack-cell {
  width: 90px; height: 60px; border-radius: 6px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; cursor: pointer; transition: all .15s;
}
.cell-occupied { background: #409EFF; color: #fff; }
.cell-occupied:hover { background: #66B1FF; }
.cell-dangerous { background: #F56C6C; color: #fff; }
.cell-dangerous:hover { background: #F89898; }
.cell-empty-slot { background: #f5f7fa; border: 2px dashed #dcdfe6; color: #c0c4cc; }
.cell-empty-slot:hover { border-color: #409EFF; color: #409EFF; }
.cell-missing { background: transparent; }
.cell-no { font-size: 12px; font-weight: 600; }
.cell-type { font-size: 10px; opacity: 0.8; }
.cell-empty-text { font-size: 12px; }
.stat-row { display: flex; justify-content: space-between; font-size: 13px; color: #606266; }
</style>
