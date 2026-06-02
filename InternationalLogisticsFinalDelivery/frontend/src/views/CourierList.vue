<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">派送员管理</h1>
    </div>

    <div class="table-container">
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="courier_no" label="编号" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="vehicle_type" label="车辆类型" />
        <el-table-column prop="vehicle_no" label="车牌号" />
        <el-table-column prop="current_area" label="负责区域" />
        <el-table-column prop="rating" label="评分">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled :max="5" />
          </template>
        </el-table-column>
        <el-table-column prop="total_deliveries" label="总派送数" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewTasks(row)">
              查看任务
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

    <el-dialog v-model="showTasksDialog" title="派送员任务" width="900px">
      <div v-if="currentCourier">
        <h4 style="margin-bottom: 15px;">{{ currentCourier.name }} 的任务列表</h4>
        <el-table :data="courierTasks" v-loading="tasksLoading" size="small">
          <el-table-column prop="task_no" label="任务号" />
          <el-table-column label="收件人">
            <template #default="{ row }">
              {{ row.customer?.name }}
            </template>
          </el-table-column>
          <el-table-column label="地址">
            <template #default="{ row }">
              {{ row.customer?.address }}
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="{ row }">
              <el-tag :type="getTaskStatusType(row.status)" size="small">
                {{ getTaskStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { courierAPI } from '../api'

const loading = ref(false)
const tasksLoading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const showTasksDialog = ref(false)
const currentCourier = ref(null)
const courierTasks = ref([])

const getStatusType = (status) => {
  const types = ['info', 'success', 'warning', 'primary']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['离职', '在职', '休息', '派送中']
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
    const res = await courierAPI.list({ page: page.value, page_size: pageSize.value })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const viewTasks = async (row) => {
  currentCourier.value = row
  tasksLoading.value = true
  try {
    const res = await courierAPI.getTasks(row.id, { page: 1, page_size: 50 })
    courierTasks.value = res.data?.list || []
    showTasksDialog.value = true
  } catch (e) {
    console.error(e)
  } finally {
    tasksLoading.value = false
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
