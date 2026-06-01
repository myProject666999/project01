<template>
  <div class="appointments-view">
    <div class="page-header">
      <h2>提箱预约管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showDialog = true">
          <el-icon><Plus /></el-icon>新建预约
        </el-button>
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 120px" @change="loadData">
          <el-option label="待处理" value="pending" />
          <el-option label="作业中" value="processing" />
          <el-option label="已完成" value="done" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-button @click="loadData"><el-icon><Refresh /></el-icon>刷新</el-button>
      </div>
    </div>

    <el-card shadow="never">
      <el-table :data="appointments" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="container_no" label="箱号" width="140" />
        <el-table-column prop="truck_plate" label="车牌号" width="120" />
        <el-table-column prop="driver_name" label="司机" width="100" />
        <el-table-column label="预约时段" min-width="200">
          <template #default="{ row }">
            {{ formatTime(row.appoint_time) }} ~ {{ formatTime(row.appoint_end) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" type="primary" size="small" @click="changeStatus(row.id, 'processing')">开始作业</el-button>
            <el-button v-if="row.status === 'processing'" type="success" size="small" @click="changeStatus(row.id, 'done')">完成</el-button>
            <el-button v-if="row.status === 'pending'" type="danger" size="small" @click="changeStatus(row.id, 'cancelled')">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showDialog" title="新建提箱预约" width="480px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="箱号">
          <el-input v-model="form.container_no" placeholder="输入要提的箱号" />
        </el-form-item>
        <el-form-item label="车牌号">
          <el-input v-model="form.truck_plate" placeholder="如: 沪A12345" />
        </el-form-item>
        <el-form-item label="司机姓名">
          <el-input v-model="form.driver_name" placeholder="司机姓名" />
        </el-form-item>
        <el-form-item label="预约开始">
          <el-date-picker v-model="form.appoint_time" type="datetime" placeholder="选择时间" value-format="YYYY-MM-DDTHH:mm" />
        </el-form-item>
        <el-form-item label="预约结束">
          <el-date-picker v-model="form.appoint_end" type="datetime" placeholder="选择时间" value-format="YYYY-MM-DDTHH:mm" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="doCreate" :loading="creating">确认预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { getAppointments, createAppointment, updateAppointmentStatus } from '../api'

const appointments = ref([])
const loading = ref(false)
const statusFilter = ref('')
const showDialog = ref(false)
const creating = ref(false)

const form = reactive({
  container_no: '', truck_plate: '', driver_name: '',
  appoint_time: '', appoint_end: ''
})

function statusTagType(s) {
  const map = { pending: 'warning', processing: 'primary', done: 'success', cancelled: 'info' }
  return map[s] || 'info'
}

function statusLabel(s) {
  const map = { pending: '待处理', processing: '作业中', done: '已完成', cancelled: '已取消' }
  return map[s] || s
}

function formatTime(t) {
  if (!t) return '-'
  return t.replace('T', ' ').substring(0, 16)
}

async function loadData() {
  loading.value = true
  try {
    const res = await getAppointments(statusFilter.value)
    appointments.value = res.data || []
  } catch (e) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

async function doCreate() {
  if (!form.container_no) { ElMessage.warning('请输入箱号'); return }
  if (!form.appoint_time || !form.appoint_end) { ElMessage.warning('请选择预约时段'); return }
  creating.value = true
  try {
    await createAppointment(form)
    ElMessage.success('预约创建成功')
    showDialog.value = false
    Object.assign(form, { container_no: '', truck_plate: '', driver_name: '', appoint_time: '', appoint_end: '' })
    loadData()
  } catch (e) {
    ElMessage.error('创建失败: ' + ((e.response && e.response.data && e.response.data.error) || e.message))
  } finally {
    creating.value = false
  }
}

async function changeStatus(id, status) {
  try {
    await updateAppointmentStatus(id, status)
    ElMessage.success('状态更新成功')
    loadData()
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

onMounted(loadData)
</script>

<style scoped>
.appointments-view { max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { font-size: 20px; color: #303133; }
.header-actions { display: flex; gap: 8px; }
</style>
