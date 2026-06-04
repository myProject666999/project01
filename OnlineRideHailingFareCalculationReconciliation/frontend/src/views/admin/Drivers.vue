<template>
  <div class="drivers">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>司机管理</span>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            新增司机
          </el-button>
        </div>
      </template>
      
      <el-table :data="drivers" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="driver_name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="license_no" label="驾驶证号" width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">在职</el-tag>
            <el-tag v-else type="info">离职</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="editDriver(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" link @click="deleteDriver(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑司机' : '新增司机'" width="500px">
      <el-form :model="driverForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="driverForm.driver_name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="driverForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="驾驶证号">
          <el-input v-model="driverForm.license_no" placeholder="请输入驾驶证号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDriver">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { driverApi } from '@/api'
import moment from 'moment'

const drivers = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)

const driverForm = ref({
  id: null,
  driver_name: '',
  phone: '',
  license_no: ''
})

onMounted(() => {
  loadDrivers()
})

const loadDrivers = async () => {
  loading.value = true
  try {
    const res = await driverApi.getList()
    drivers.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEdit.value = false
  driverForm.value = {
    id: null,
    driver_name: '',
    phone: '',
    license_no: ''
  }
  dialogVisible.value = true
}

const editDriver = (row) => {
  isEdit.value = true
  driverForm.value = { ...row }
  dialogVisible.value = true
}

const saveDriver = async () => {
  try {
    if (isEdit.value) {
      await driverApi.update(driverForm.value.id, driverForm.value)
      ElMessage.success('更新成功')
    } else {
      await driverApi.create(driverForm.value)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    loadDrivers()
  } catch (e) {
    console.error(e)
    ElMessage.error('保存失败')
  }
}

const deleteDriver = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除此司机吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await driverApi.delete(row.id)
    ElMessage.success('删除成功')
    loadDrivers()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
      ElMessage.error('删除失败')
    }
  }
}

const formatTime = (time) => {
  return time ? moment(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
</style>
