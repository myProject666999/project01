<template>
  <div class="containers-view">
    <div class="page-header">
      <h2>集装箱管理</h2>
      <div class="header-actions">
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 120px" @change="loadData">
          <el-option label="在场" value="yard" />
          <el-option label="已出" value="out" />
        </el-select>
        <el-button @click="loadData"><el-icon><Refresh /></el-icon>刷新</el-button>
      </div>
    </div>

    <el-card shadow="never">
      <el-table :data="containers" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="container_no" label="箱号" width="140" />
        <el-table-column prop="owner_code" label="船公司" width="100" />
        <el-table-column prop="size_type" label="箱型" width="80" />
        <el-table-column prop="weight_kg" label="重量(kg)" width="100" />
        <el-table-column label="危险品" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.is_dangerous" type="danger" size="small">IMO {{ row.imo_class }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="进场时间" width="160">
          <template #default="{ row }">{{ formatTime(row.arrival_time) }}</template>
        </el-table-column>
        <el-table-column label="预计出场" width="160">
          <template #default="{ row }">{{ row.departure_time ? formatTime(row.departure_time) : '-' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'yard' ? 'success' : 'info'" size="small">
              {{ row.status === 'yard' ? '在场' : '已出' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reshuffle_count" label="翻箱次数" width="100" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getContainers } from '../api'

const containers = ref([])
const loading = ref(false)
const statusFilter = ref('')

async function loadData() {
  loading.value = true
  try {
    const res = await getContainers(statusFilter.value)
    containers.value = res.data || []
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

function formatTime(t) {
  if (!t) return '-'
  return t.replace('T', ' ').substring(0, 16)
}

onMounted(loadData)
</script>

<style scoped>
.containers-view { max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { font-size: 20px; color: #303133; }
.header-actions { display: flex; gap: 8px; }
</style>
