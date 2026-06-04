<template>
  <div class="page-container">
    <div class="page-header">
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2 class="page-title">移动详情</h2>
    </div>

    <el-card v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="移动单号">{{ movement.movement_no }}</el-descriptions-item>
        <el-descriptions-item label="移动类型">
          <el-tag>{{ movement.movement_type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="藏品名称">{{ movement.collection?.name }}</el-descriptions-item>
        <el-descriptions-item label="藏品编号">{{ movement.collection?.collection_no }}</el-descriptions-item>
        <el-descriptions-item label="原位置">{{ movement.from_location }}</el-descriptions-item>
        <el-descriptions-item label="目标位置">{{ movement.to_location }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(movement.status)">{{ movement.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(movement.created_at) }}</el-descriptions-item>
        <el-descriptions-item v-if="movement.exhibition_name" label="展览名称" :span="2">
          {{ movement.exhibition_name }}
        </el-descriptions-item>
        <el-descriptions-item v-if="movement.borrower" label="借展单位">
          {{ movement.borrower }}
        </el-descriptions-item>
        <el-descriptions-item v-if="movement.expected_return_date" label="预计归还日期">
          {{ formatDate(movement.expected_return_date) }}
        </el-descriptions-item>
        <el-descriptions-item label="移动原因" :span="2">
          {{ movement.reason }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { getMovement } from '@/api'

const route = useRoute()
const loading = ref(false)
const movement = ref({})

const getStatusTagType = (status) => {
  const types = {
    '待审批': 'warning',
    '已批准': 'primary',
    '出库中': 'info',
    '已完成': 'success',
    '已拒绝': 'danger',
    '已取消': 'info'
  }
  return types[status] || 'info'
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const loadData = async () => {
  loading.value = true
  try {
    movement.value = await getMovement(route.params.id)
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
