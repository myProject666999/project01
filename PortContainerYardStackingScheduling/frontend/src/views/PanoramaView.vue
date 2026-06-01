<template>
  <div class="panorama-view">
    <div class="page-header">
      <h2>堆场全景视图</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showInDialog = true">
          <el-icon><Plus /></el-icon>进场装箱
        </el-button>
        <el-button type="warning" @click="showOutDialog = true">
          <el-icon><Minus /></el-icon>出场提箱
        </el-button>
        <el-button @click="loadData">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <div class="stats-bar">
      <el-card shadow="never" class="stat-card">
        <div class="stat-num">{{ stats.total }}</div>
        <div class="stat-label">总槽位</div>
      </el-card>
      <el-card shadow="never" class="stat-card stat-occupied">
        <div class="stat-num">{{ stats.occupied }}</div>
        <div class="stat-label">已占用</div>
      </el-card>
      <el-card shadow="never" class="stat-card stat-empty">
        <div class="stat-num">{{ stats.empty }}</div>
        <div class="stat-label">空闲</div>
      </el-card>
      <el-card shadow="never" class="stat-card stat-danger">
        <div class="stat-num">{{ stats.dangerous }}</div>
        <div class="stat-label">危险品</div>
      </el-card>
    </div>

    <div v-for="zone in zoneData" :key="zone.zoneId" class="zone-section">
      <div class="zone-header">
        <el-tag :type="zone.zoneType === 'dangerous' ? 'danger' : 'primary'" size="large" effect="dark">
          {{ zone.zoneName }}
        </el-tag>
        <span class="zone-util">利用率 {{ zone.utilization }}%</span>
      </div>
      <div class="bay-grid">
        <div v-for="bay in zone.bays" :key="bay.bay" class="bay-card" @click="goToBay(zone.zoneId, bay.bay)">
          <div class="bay-title">Bay {{ bay.bay }}</div>
          <div class="bay-visual">
            <div v-for="row in bay.rows" :key="row" class="bay-row">
              <div
                v-for="tier in bay.tiers"
                :key="tier"
                class="bay-cell"
                :class="{
                  'cell-occupied': getCellStatus(zone.zoneId, bay.bay, row, tier) === 'occupied',
                  'cell-dangerous': getCellDangerous(zone.zoneId, bay.bay, row, tier),
                  'cell-empty': getCellStatus(zone.zoneId, bay.bay, row, tier) === 'empty'
                }"
                :title="getCellTooltip(zone.zoneId, bay.bay, row, tier)"
              >
                <span v-if="getCellStatus(zone.zoneId, bay.bay, row, tier) === 'occupied'" class="cell-text">
                  {{ getCellContainer(zone.zoneId, bay.bay, row, tier) }}
                </span>
              </div>
            </div>
          </div>
          <div class="bay-footer">
            <span>{{ bay.occupied }}/{{ bay.total }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showInDialog" title="集装箱进场" width="520px" destroy-on-close>
      <el-form :model="inForm" label-width="100px">
        <el-form-item label="箱号">
          <el-input v-model="inForm.container_no" placeholder="如: COSCU1234567" />
        </el-form-item>
        <el-form-item label="船公司">
          <el-input v-model="inForm.owner_code" placeholder="如: COSCO" />
        </el-form-item>
        <el-form-item label="箱型">
          <el-select v-model="inForm.size_type">
            <el-option label="20GP" value="20GP" />
            <el-option label="40HQ" value="40HQ" />
            <el-option label="40RF" value="40RF" />
            <el-option label="20RF" value="20RF" />
          </el-select>
        </el-form-item>
        <el-form-item label="重量(kg)">
          <el-input-number v-model="inForm.weight_kg" :min="0" :max="40000" />
        </el-form-item>
        <el-form-item label="危险品">
          <el-switch v-model="inForm.is_dangerous" />
        </el-form-item>
        <el-form-item v-if="inForm.is_dangerous" label="IMO等级">
          <el-select v-model="inForm.imo_class">
            <el-option v-for="c in imoClasses" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="进场时间">
          <el-date-picker v-model="inForm.arrival_time" type="datetime" placeholder="选择时间" value-format="YYYY-MM-DDTHH:mm" />
        </el-form-item>
        <el-form-item label="预计出场">
          <el-date-picker v-model="inForm.departure_time" type="datetime" placeholder="选择时间" value-format="YYYY-MM-DDTHH:mm" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInDialog = false">取消</el-button>
        <el-button type="primary" @click="doContainerIn" :loading="inLoading">确认进场</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showOutDialog" title="集装箱出场" width="400px" destroy-on-close>
      <el-form :model="outForm" label-width="80px">
        <el-form-item label="箱号">
          <el-input v-model="outForm.container_no" placeholder="输入出场箱号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showOutDialog = false">取消</el-button>
        <el-button type="warning" @click="doContainerOut" :loading="outLoading">确认出场</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Minus, Refresh } from '@element-plus/icons-vue'
import { getPanorama, getZones, containerIn, containerOut } from '../api'

const router = useRouter()
const slots = ref([])
const zones = ref([])
const loading = ref(false)

const showInDialog = ref(false)
const showOutDialog = ref(false)
const inLoading = ref(false)
const outLoading = ref(false)

const imoClasses = ['1', '2', '3', '4', '5.1', '5.2', '6.1', '6.2', '7', '8', '9']

const inForm = reactive({
  container_no: '', owner_code: '', size_type: '20GP',
  weight_kg: 0, is_dangerous: false, imo_class: '',
  arrival_time: '', departure_time: ''
})

const outForm = reactive({ container_no: '' })

const slotMap = computed(() => {
  const m = {}
  for (const s of slots.value) {
    const key = `${s.zone_id}-${s.bay}-${s.row}-${s.tier}`
    m[key] = s
  }
  return m
})

const stats = computed(() => {
  let total = 0, occupied = 0, dangerous = 0
  for (const s of slots.value) {
    total++
    if (s.status === 'occupied') occupied++
  }
  for (const z of zones.value) {
    if (z.zone_type === 'dangerous') {
      for (const s of slots.value) {
        if (s.zone_id === z.id && s.status === 'occupied') dangerous++
      }
    }
  }
  return { total, occupied, empty: total - occupied, dangerous }
})

const zoneData = computed(() => {
  return zones.value.map(z => {
    const zoneSlots = slots.value.filter(s => s.zone_id === z.id)
    const bays = []
    for (let b = 1; b <= 10; b++) {
      const baySlots = zoneSlots.filter(s => s.bay === b)
      const occ = baySlots.filter(s => s.status === 'occupied').length
      bays.push({
        bay: b,
        rows: 6,
        tiers: 5,
        occupied: occ,
        total: 30,
      })
    }
    const occ = zoneSlots.filter(s => s.status === 'occupied').length
    const tot = zoneSlots.length
    return {
      zoneId: z.id,
      zoneName: z.zone_name,
      zoneType: z.zone_type,
      bays,
      utilization: tot > 0 ? (occ / tot * 100).toFixed(1) : '0.0',
    }
  })
})

function getCellStatus(zoneId, bay, row, tier) {
  const key = `${zoneId}-${bay}-${row}-${tier}`
  const s = slotMap.value[key]
  return s ? s.status : 'empty'
}

function getCellDangerous(zoneId, bay, row, tier) {
  const key = `${zoneId}-${bay}-${row}-${tier}`
  const s = slotMap.value[key]
  return s && s.container_no && s.container_no.startsWith('DG')
}

function getCellContainer(zoneId, bay, row, tier) {
  const key = `${zoneId}-${bay}-${row}-${tier}`
  const s = slotMap.value[key]
  if (!s || !s.container_no) return ''
  if (s.container_no.length > 6) return s.container_no.slice(-6)
  return s.container_no
}

function getCellTooltip(zoneId, bay, row, tier) {
  const key = `${zoneId}-${bay}-${row}-${tier}`
  const s = slotMap.value[key]
  if (!s) return '空闲'
  if (s.status === 'occupied' && s.container_no) return `${s.container_no} [Bay${bay}-Row${row}-Tier${tier}]`
  return `Bay${bay}-Row${row}-Tier${tier} ${s.status}`
}

function goToBay(zoneId, bay) {
  router.push(`/bay/${zoneId}/${bay}`)
}

async function loadData() {
  loading.value = true
  try {
    const [zonesRes, panoramaRes] = await Promise.all([getZones(), getPanorama()])
    zones.value = zonesRes.data || []
    slots.value = panoramaRes.data || []
  } catch (e) {
    ElMessage.error('加载数据失败: ' + (e.message || e))
  } finally {
    loading.value = false
  }
}

async function doContainerIn() {
  if (!inForm.container_no) { ElMessage.warning('请输入箱号'); return }
  if (!inForm.arrival_time) { ElMessage.warning('请选择进场时间'); return }
  inLoading.value = true
  try {
    await containerIn(inForm)
    ElMessage.success('进场成功')
    showInDialog.value = false
    Object.assign(inForm, { container_no: '', owner_code: '', size_type: '20GP', weight_kg: 0, is_dangerous: false, imo_class: '', arrival_time: '', departure_time: '' })
    loadData()
  } catch (e) {
    ElMessage.error('进场失败: ' + ((e.response && e.response.data && e.response.data.error) || e.message))
  } finally {
    inLoading.value = false
  }
}

async function doContainerOut() {
  if (!outForm.container_no) { ElMessage.warning('请输入箱号'); return }
  outLoading.value = true
  try {
    const res = await containerOut(outForm)
    const reshuffles = res.data.reshuffle_count || 0
    if (reshuffles > 0) {
      ElMessage.warning(`出场完成，翻箱 ${reshuffles} 次`)
    } else {
      ElMessage.success('出场完成，无翻箱')
    }
    showOutDialog.value = false
    outForm.container_no = ''
    loadData()
  } catch (e) {
    ElMessage.error('出场失败: ' + ((e.response && e.response.data && e.response.data.error) || e.message))
  } finally {
    outLoading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.panorama-view { max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { font-size: 20px; color: #303133; }
.header-actions { display: flex; gap: 8px; }
.stats-bar { display: flex; gap: 16px; margin-bottom: 20px; }
.stat-card { flex: 1; text-align: center; }
.stat-card .stat-num { font-size: 28px; font-weight: 700; }
.stat-card .stat-label { font-size: 13px; color: #909399; margin-top: 4px; }
.stat-occupied .stat-num { color: #E6A23C; }
.stat-empty .stat-num { color: #67C23A; }
.stat-danger .stat-num { color: #F56C6C; }
.zone-section { margin-bottom: 24px; }
.zone-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.zone-util { font-size: 14px; color: #909399; }
.bay-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.bay-card {
  background: #fff; border-radius: 8px; padding: 10px; cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08); transition: box-shadow .2s, transform .15s;
}
.bay-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); transform: translateY(-2px); }
.bay-title { font-size: 14px; font-weight: 600; color: #303133; margin-bottom: 6px; }
.bay-visual { display: flex; flex-direction: column; gap: 2px; }
.bay-row { display: flex; gap: 2px; }
.bay-cell {
  flex: 1; height: 18px; border-radius: 2px; background: #f0f0f0;
  display: flex; align-items: center; justify-content: center; font-size: 8px; color: #fff;
}
.cell-occupied { background: #409EFF; }
.cell-dangerous { background: #F56C6C; }
.cell-empty { background: #f0f0f0; }
.cell-text { font-size: 7px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bay-footer { font-size: 12px; color: #909399; margin-top: 4px; text-align: right; }
</style>
