<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">路线规划</h1>
      <el-button type="primary" @click="$router.push('/routes/create')">
        <el-icon><Plus /></el-icon>
        创建路线
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="route_no" label="路线编号" />
        <el-table-column prop="name" label="路线名称" />
        <el-table-column prop="area" label="负责区域" />
        <el-table-column label="仓库">
          <template #default="{ row }">
            {{ row.warehouse?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="派送员">
          <template #default="{ row }">
            {{ row.courier?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="任务进度">
          <template #default="{ row }">
            {{ row.completed_tasks }} / {{ row.total_tasks }}
          </template>
        </el-table-column>
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
            <el-button v-if="row.status === 2" type="primary" link @click="startRoute(row)">
              开始派送
            </el-button>
            <el-button v-if="row.status === 3" type="success" link @click="completeRoute(row)">
              完成路线
            </el-button>
            <el-button type="info" link @click="viewDetail(row)">
              查看详情
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

    <el-dialog v-model="showDetailDialog" title="路线详情" width="800px">
      <div v-if="currentRoute">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="路线编号">{{ currentRoute.route_no }}</el-descriptions-item>
          <el-descriptions-item label="路线名称">{{ currentRoute.name }}</el-descriptions-item>
          <el-descriptions-item label="派送员">{{ currentRoute.courier?.name }}</el-descriptions-item>
          <el-descriptions-item label="负责区域">{{ currentRoute.area }}</el-descriptions-item>
          <el-descriptions-item label="任务进度">
            {{ currentRoute.completed_tasks }} / {{ currentRoute.total_tasks }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentRoute.status)">
              {{ getStatusText(currentRoute.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 20px 0 10px;">派送任务列表</h4>
        <el-table :data="currentRoute.tasks" size="small">
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
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { routeAPI } from '../api'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const showDetailDialog = ref(false)
const currentRoute = ref(null)

const getStatusType = (status) => {
  const types = ['', 'info', 'warning', 'primary', 'success']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['', '待分配', '已分配', '进行中', '已完成']
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
    const res = await routeAPI.list({ page: page.value, page_size: pageSize.value })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const startRoute = async (row) => {
  try {
    await ElMessageBox.confirm('确定开始此路线的派送吗？', '提示', { type: 'warning' })
    await routeAPI.start(row.id)
    ElMessage.success('已开始派送')
    loadData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const completeRoute = async (row) => {
  try {
    await ElMessageBox.confirm('确定完成此路线吗？', '提示', { type: 'warning' })
    await routeAPI.complete(row.id)
    ElMessage.success('路线已完成')
    loadData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const viewDetail = async (row) => {
  try {
    const res = await routeAPI.get(row.id)
    currentRoute.value = res.data
    showDetailDialog.value = true
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
