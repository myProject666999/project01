<template>
  <div class="page-container">
    <div class="page-header">
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2 class="page-title">盘点详情</h2>
    </div>

    <el-card v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="盘点编号">{{ plan.plan_no }}</el-descriptions-item>
        <el-descriptions-item label="盘点名称">{{ plan.plan_name }}</el-descriptions-item>
        <el-descriptions-item label="盘点范围">{{ plan.location_scope }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(plan.status)">{{ plan.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="应盘点数量">{{ plan.total_count }}</el-descriptions-item>
        <el-descriptions-item label="已盘点数量">{{ plan.checked_count }}</el-descriptions-item>
        <el-descriptions-item label="待查数量">{{ plan.missing_count }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(plan.created_at) }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">盘点明细</el-divider>
      
      <el-table :data="plan.items" stripe border>
        <el-table-column prop="collection_no" label="藏品编号" width="160" />
        <el-table-column prop="collection_name" label="藏品名称" min-width="180" />
        <el-table-column prop="expected_location" label="应在位置" min-width="150" />
        <el-table-column prop="actual_location" label="实际位置" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getItemStatusType(row.status)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checked_at" label="盘点时间" width="180">
          <template #default="{ row }">
            {{ row.checked_at ? formatDate(row.checked_at) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="是否离线" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.is_offline" type="warning" size="small">离线</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { getInventoryPlan } from '@/api'

const route = useRoute()
const loading = ref(false)
const plan = ref({ items: [] })

const getStatusTagType = (status) => {
  const types = {
    '待执行': 'info',
    '进行中': 'warning',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

const getItemStatusType = (status) => {
  const types = {
    '待盘点': 'info',
    '已盘点': 'success',
    '待查': 'danger',
    '异常': 'warning'
  }
  return types[status] || 'info'
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const loadData = async () => {
  loading.value = true
  try {
    plan.value = await getInventoryPlan(route.params.id)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
