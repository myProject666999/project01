<template>
  <div class="processing">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>加工任务列表</span>
          <el-button type="primary" @click="generateTasks">
            <el-icon><Refresh /></el-icon>
            生成加工任务
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-form :inline="true">
          <el-form-item label="选择日期">
            <el-date-picker v-model="filterDate" type="date" placeholder="选择日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-table :data="tasks" style="width: 100%">
        <el-table-column prop="task_no" label="任务编号" width="180" />
        <el-table-column prop="product.name" label="菜品名称" />
        <el-table-column prop="total_quantity" label="总数量" width="120">
          <template #default="{ row }">
            {{ row.total_quantity }} kg
          </template>
        </el-table-column>
        <el-table-column prop="equipment.name" label="设备" width="120" />
        <el-table-column label="计划时间" width="200">
          <template #default="{ row }">
            <div v-if="row.plan_start_time">
              <div>开始: {{ formatDateTime(row.plan_start_time) }}</div>
              <div>结束: {{ formatDateTime(row.plan_end_time) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="实际时间" width="200">
          <template #default="{ row }">
            <div v-if="row.actual_start_time">
              <div>开始: {{ formatDateTime(row.actual_start_time) }}</div>
              <div>结束: {{ formatDateTime(row.actual_end_time) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="worker" label="操作人员" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-dropdown v-if="row.status !== 2" @command="(cmd) => updateStatus(row, cmd)">
              <el-button link type="primary">状态操作</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="1" v-if="row.status === 0">开始加工</el-dropdown-item>
                  <el-dropdown-item :command="2" v-if="row.status === 1">完成加工</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="generateDialogVisible" title="生成加工任务" width="400px">
      <el-form :model="generateForm" label-width="100px">
        <el-form-item label="配送日期">
          <el-date-picker v-model="generateForm.delivery_date" type="date" placeholder="选择配送日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="generateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmGenerate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getProcessingTasks, generateProcessingTasks, updateProcessingStatus } from '@/api'

const tasks = ref([])
const filterDate = ref('')
const generateDialogVisible = ref(false)
const generateForm = reactive({
  delivery_date: ''
})

const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

const getStatusType = (status) => {
  const types = ['info', 'warning', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['待开始', '进行中', '已完成', '已取消']
  return texts[status] || '未知'
}

const loadData = async () => {
  const params = {}
  if (filterDate.value) params.date = filterDate.value
  
  getProcessingTasks(params).then(res => {
    tasks.value = res.data || []
  }).catch(err => {
    console.error('加载加工任务失败', err)
  })
}

const resetFilter = () => {
  filterDate.value = ''
  loadData()
}

const generateTasks = () => {
  generateForm.delivery_date = ''
  generateDialogVisible.value = true
}

const confirmGenerate = async () => {
  if (!generateForm.delivery_date) {
    ElMessage.error('请选择配送日期')
    return
  }
  
  try {
    await generateProcessingTasks(generateForm)
    ElMessage.success('加工任务生成成功')
    generateDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('生成加工任务失败', error)
  }
}

const updateStatus = async (row, status) => {
  try {
    await updateProcessingStatus(row.id, { status, worker: '操作员' })
    ElMessage.success('状态更新成功')
    loadData()
  } catch (error) {
    console.error('更新状态失败', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
