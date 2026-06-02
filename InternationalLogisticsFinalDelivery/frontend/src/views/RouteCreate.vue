<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">创建派送路线</h1>
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="table-container">
          <template #header>
            <span>待分配任务</span>
          </template>
          <el-table :data="pendingTasks" v-loading="loading" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="task_no" label="任务号" />
            <el-table-column label="收件人">
              <template #default="{ row }">
                {{ row.customer?.name || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="地址">
              <template #default="{ row }">
                {{ row.customer?.address || '-' }}
              </template>
            </el-table-column>
            <el-table-column label="城市">
              <template #default="{ row }">
                {{ row.customer?.city || '-' }}
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 15px; text-align: right;">
            <el-tag type="info">已选择 {{ selectedTasks.length }} 个任务</el-tag>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="table-container">
          <template #header>
            <span>路线信息</span>
          </template>
          <el-form :model="routeForm" label-width="100px">
            <el-form-item label="仓库">
              <el-select v-model="routeForm.warehouse_id" placeholder="请选择仓库">
                <el-option
                  v-for="w in warehouses"
                  :key="w.id"
                  :label="w.name"
                  :value="w.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="派送员">
              <el-select v-model="routeForm.courier_id" placeholder="请选择派送员">
                <el-option
                  v-for="c in couriers"
                  :key="c.id"
                  :label="c.name"
                  :value="c.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="路线名称">
              <el-input v-model="routeForm.name" placeholder="请输入路线名称" />
            </el-form-item>
            <el-form-item label="负责区域">
              <el-input v-model="routeForm.area" placeholder="请输入负责区域" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="createRoute" :disabled="selectedTasks.length === 0">
                <el-icon><Check /></el-icon>
                创建路线
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="table-container" style="margin-top: 20px;" v-if="selectedTasks.length > 0">
          <template #header>
            <span>已选任务预览</span>
          </template>
          <div v-for="(task, index) in selectedTasks" :key="task.id" class="task-item">
            <span class="task-order">{{ index + 1 }}</span>
            <span class="task-info">
              <strong>{{ task.customer?.name }}</strong>
              <br />
              <small>{{ task.customer?.address }}</small>
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { taskAPI, warehouseAPI, courierAPI, routeAPI } from '../api'

const router = useRouter()
const loading = ref(false)
const pendingTasks = ref([])
const warehouses = ref([])
const couriers = ref([])
const selectedTasks = ref([])

const routeForm = ref({
  warehouse_id: null,
  courier_id: null,
  name: '',
  area: ''
})

const handleSelectionChange = (val) => {
  selectedTasks.value = val
}

const loadPendingTasks = async () => {
  loading.value = true
  try {
    const res = await taskAPI.listPending({ page: 1, page_size: 100 })
    pendingTasks.value = res.data?.list || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadWarehouses = async () => {
  try {
    const res = await warehouseAPI.list()
    warehouses.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

const loadCouriers = async () => {
  try {
    const res = await courierAPI.list({ page: 1, page_size: 100, status: 1 })
    couriers.value = res.data?.list || []
  } catch (e) {
    console.error(e)
  }
}

const createRoute = async () => {
  if (!routeForm.value.warehouse_id || !routeForm.value.courier_id) {
    ElMessage.warning('请选择仓库和派送员')
    return
  }
  if (selectedTasks.value.length === 0) {
    ElMessage.warning('请选择至少一个任务')
    return
  }
  try {
    const data = {
      ...routeForm.value,
      task_ids: selectedTasks.value.map(t => t.id)
    }
    await routeAPI.create(data)
    ElMessage.success('路线创建成功')
    router.push('/routes')
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadPendingTasks()
  loadWarehouses()
  loadCouriers()
})
</script>

<style scoped>
.task-item {
  display: flex;
  gap: 15px;
  padding: 12px;
  border-bottom: 1px solid #f0f2f5;
  align-items: center;
}

.task-item:last-child {
  border-bottom: none;
}

.task-order {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.task-info {
  flex: 1;
}

.task-info strong {
  color: #303133;
}

.task-info small {
  color: #909399;
}
</style>
