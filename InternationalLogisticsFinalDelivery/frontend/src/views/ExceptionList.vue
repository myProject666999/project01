<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">异常处理</h1>
      <div>
        <el-select v-model="filterStatus" @change="loadData" placeholder="筛选状态" clearable style="margin-right: 10px; width: 150px;">
          <el-option label="待处理" :value="1" />
          <el-option label="处理中" :value="2" />
          <el-option label="已处理" :value="3" />
          <el-option label="已关闭" :value="4" />
        </el-select>
        <el-select v-model="filterType" @change="loadData" placeholder="筛选类型" clearable style="width: 150px;">
          <el-option label="拒收" value="reject" />
          <el-option label="无人在家" value="no_one" />
          <el-option label="地址错误" value="wrong_address" />
          <el-option label="破损" value="damaged" />
          <el-option label="丢失" value="lost" />
        </el-select>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="异常类型">
          <template #default="{ row }">
            <el-tag :type="getExceptionType(row.exception_type)">
              {{ getExceptionText(row.exception_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="异常描述" show-overflow-tooltip />
        <el-table-column label="处理方式">
          <template #default="{ row }">
            {{ getHandlingText(row.handling_type) }}
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="next_attempt_time" label="下次尝试时间" />
        <el-table-column prop="created_at" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link v-if="row.status === 1" @click="handleException(row)">
              处理
            </el-button>
            <el-button type="info" link @click="viewDetail(row)">
              详情
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

    <el-dialog v-model="showHandleDialog" title="处理异常" width="600px">
      <el-form :model="handleForm" label-width="100px">
        <el-form-item label="处理方式">
          <el-select v-model="handleForm.handling_type">
            <el-option label="重新派送" value="re_deliver" />
            <el-option label="退回仓库" value="return_warehouse" />
            <el-option label="联系客户" value="contact_customer" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理结果">
          <el-input v-model="handleForm.handling_result" type="textarea" rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showHandleDialog = false">取消</el-button>
        <el-button type="primary" @click="submitHandle">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" title="异常详情" width="700px">
      <div v-if="currentException">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="异常类型">
            <el-tag :type="getExceptionType(currentException.exception_type)">
              {{ getExceptionText(currentException.exception_type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentException.status)">
              {{ getStatusText(currentException.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理方式" :span="2">
            {{ getHandlingText(currentException.handling_type) }}
          </el-descriptions-item>
          <el-descriptions-item label="异常描述" :span="2">
            {{ currentException.description }}
          </el-descriptions-item>
          <el-descriptions-item label="处理结果" :span="2">
            {{ currentException.handling_result || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ currentException.created_at }}
          </el-descriptions-item>
          <el-descriptions-item label="处理时间">
            {{ currentException.handled_at || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentException.photo_url" style="margin-top: 20px;">
          <h4>异常照片</h4>
          <img :src="currentException.photo_url" style="max-width: 300px; border-radius: 8px;" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { exceptionAPI } from '../api'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filterStatus = ref(null)
const filterType = ref('')
const showHandleDialog = ref(false)
const showDetailDialog = ref(false)
const currentException = ref(null)
const currentExceptionId = ref(null)

const handleForm = ref({
  handling_type: '',
  handling_result: ''
})

const getExceptionType = (type) => {
  const types = {
    'reject': 'danger',
    'no_one': 'warning',
    'wrong_address': 'danger',
    'damaged': 'danger',
    'lost': 'danger'
  }
  return types[type] || 'info'
}

const getExceptionText = (type) => {
  const texts = {
    'reject': '拒收',
    'no_one': '无人在家',
    'wrong_address': '地址错误',
    'damaged': '破损',
    'lost': '丢失'
  }
  return texts[type] || type
}

const getHandlingText = (type) => {
  const texts = {
    'return_warehouse': '退回仓库',
    're_deliver': '重新派送',
    'contact_customer': '联系客户',
    'other': '其他'
  }
  return texts[type] || '-'
}

const getStatusType = (status) => {
  const types = ['', 'warning', 'primary', 'success', 'info']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['', '待处理', '处理中', '已处理', '已关闭']
  return texts[status] || '未知'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await exceptionAPI.list({
      page: page.value,
      page_size: pageSize.value,
      status: filterStatus.value || 0,
      type: filterType.value
    })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleException = (row) => {
  currentExceptionId.value = row.id
  handleForm.value = {
    handling_type: row.handling_type || '',
    handling_result: ''
  }
  showHandleDialog.value = true
}

const submitHandle = async () => {
  if (!handleForm.value.handling_type) {
    ElMessage.warning('请选择处理方式')
    return
  }
  try {
    await exceptionAPI.handle({
      exception_id: currentExceptionId.value,
      handled_by: 1,
      ...handleForm.value
    })
    ElMessage.success('处理成功')
    showHandleDialog.value = false
    loadData()
  } catch (e) {
    console.error(e)
  }
}

const viewDetail = async (row) => {
  try {
    const res = await exceptionAPI.get(row.id)
    currentException.value = res.data
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
