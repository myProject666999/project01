<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">包裹管理</h1>
      <div>
        <el-input v-model="searchKw" placeholder="搜索单号/收件人" style="width: 250px; margin-right: 10px;" @keyup.enter="loadData" />
        <el-button type="primary" @click="loadData">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="package_no" label="包裹单号" />
        <el-table-column label="收件人">
          <template #default="{ row }">
            {{ row.customer?.name }}
          </template>
        </el-table-column>
        <el-table-column label="收件人电话">
          <template #default="{ row }">
            {{ row.customer?.phone }}
          </template>
        </el-table-column>
        <el-table-column label="收件地址">
          <template #default="{ row }">
            {{ row.customer?.address }}
          </template>
        </el-table-column>
        <el-table-column label="批次号">
          <template #default="{ row }">
            {{ row.batch?.batch_no || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(kg)" />
        <el-table-column prop="language" label="语言" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewLabel(row)">
              面单
            </el-button>
            <el-button type="info" link @click="viewTask(row)">
              任务
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <el-dialog v-model="showTaskDialog" title="派送任务" width="700px">
      <div v-if="currentTask">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务号">{{ currentTask.task_no }}</el-descriptions-item>
          <el-descriptions-item label="派送员">{{ currentTask.courier?.name || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getTaskStatusType(currentTask.status)">
              {{ getTaskStatusText(currentTask.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="线路号">
            {{ currentTask.route?.route_no || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="签收时间">
            {{ currentTask.delivered_at || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="签收人">
            {{ currentTask.signed_by || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentTask.proof" style="margin-top: 20px;">
          <h4>签收凭证</h4>
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            <div>
              <p style="font-size: 12px; color: #999; margin-bottom: 5px;">照片</p>
              <img v-if="currentTask.proof.photo_url" :src="currentTask.proof.photo_url" style="max-width: 200px; border-radius: 8px;" />
              <p v-else style="color: #999;">无</p>
            </div>
            <div>
              <p style="font-size: 12px; color: #999; margin-bottom: 5px;">签名</p>
              <img v-if="currentTask.proof.signature_url" :src="currentTask.proof.signature_url" style="max-width: 200px; border-radius: 8px;" />
              <p v-else style="color: #999;">无</p>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { packageAPI, taskAPI } from '../api'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const searchKw = ref('')
const showTaskDialog = ref(false)
const currentTask = ref(null)

const getStatusType = (status) => {
  const types = ['info', 'warning', 'primary', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待入库', '已入库', '派送中', '已签收', '异常']
  return texts[status] || '未知'
}

const getTaskStatusType = (status) => {
  const types = ['', 'info', 'warning', 'primary', 'success', 'danger']
  return types[status] || 'info'
}

const getTaskStatusText = (status) => {
  const texts = ['', '待接单', '已接单', '派送中', '已签收', '异常']
  return texts[status] || '未知'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await packageAPI.list({
      page: page.value, page_size: pageSize.value, keyword: searchKw.value
    })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const viewLabel = (row) => {
  window.open(`/#/labels/${row.id}`, '_blank')
}

const viewTask = async (row) => {
  try {
    const res = await taskAPI.getByPackage(row.id)
    currentTask.value = res.data
    showTaskDialog.value = true
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
