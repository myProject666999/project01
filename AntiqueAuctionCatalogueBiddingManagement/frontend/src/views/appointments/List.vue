<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>预展预约管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>添加预约
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-select v-model="searchForm.auction_id" placeholder="选择拍卖会" clearable style="width: 200px" @change="fetchList">
          <el-option v-for="auc in auctionList" :key="auc.id" :label="auc.name" :value="auc.id" />
        </el-select>
        <el-date-picker v-model="searchForm.date" type="date" placeholder="选择日期" clearable style="width: 180px; margin-left: 10px" value-format="YYYY-MM-DD" @change="fetchList" />
        <el-select v-model="searchForm.check_in" placeholder="签到状态" clearable style="width: 120px; margin-left: 10px" @change="fetchList">
          <el-option label="未签到" :value="0" />
          <el-option label="已签到" :value="1" />
        </el-select>
        <el-input v-model="searchForm.keyword" placeholder="搜索竞买人" clearable style="width: 200px; margin-left: 10px" @keyup.enter="fetchList" />
        <el-button type="primary" style="margin-left: 10px" @click="fetchList">搜索</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="bidder.name" label="竞买人" width="120" />
        <el-table-column prop="bidder.phone" label="电话" width="130" />
        <el-table-column prop="appointment_date" label="预约日期" width="120" />
        <el-table-column prop="appointment_time" label="时段" width="100" />
        <el-table-column prop="visitor_count" label="人数" width="80" />
        <el-table-column prop="check_in" label="签到" width="100">
          <template #default="{ row }">
            <el-tag :type="row.check_in ? 'success' : 'info'">
              {{ row.check_in ? '已签到' : '未签到' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="check_in_time" label="签到时间" width="180">
          <template #default="{ row }">
            {{ row.check_in_time || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-if="!row.check_in" type="success" link @click="handleCheckIn(row)">签到</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :total="pagination.total"
        style="margin-top: 20px; justify-content: flex-end"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" title="添加预约" width="600px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="拍卖会" prop="auction_id">
          <el-select v-model="form.auction_id" style="width: 100%">
            <el-option v-for="auc in auctionList" :key="auc.id" :label="auc.name" :value="auc.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="竞买人" prop="bidder_id">
          <el-select v-model="form.bidder_id" filterable style="width: 100%">
            <el-option v-for="bidder in bidderList" :key="bidder.id" :label="bidder.name + ' - ' + bidder.phone" :value="bidder.id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="预约日期" prop="appointment_date">
              <el-date-picker v-model="form.appointment_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预约时段">
              <el-select v-model="form.appointment_time" style="width: 100%" placeholder="请选择">
                <el-option label="上午 09:00-12:00" value="09:00-12:00" />
                <el-option label="下午 14:00-17:00" value="14:00-17:00" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="参观人数">
          <el-input-number v-model="form.visitor_count" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAppointmentList, createAppointment, checkInAppointment, deleteAppointment, getAuctionList, getBidderList } from '../../api'

const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const tableData = ref([])
const auctionList = ref([])
const bidderList = ref([])

const searchForm = reactive({
  auction_id: '',
  date: '',
  check_in: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const form = reactive({
  auction_id: null,
  bidder_id: null,
  appointment_date: '',
  appointment_time: '',
  visitor_count: 1,
  remark: ''
})

const rules = {
  auction_id: [{ required: true, message: '请选择拍卖会', trigger: 'change' }],
  bidder_id: [{ required: true, message: '请选择竞买人', trigger: 'change' }],
  appointment_date: [{ required: true, message: '请选择预约日期', trigger: 'change' }]
}

const fetchAuctions = async () => {
  const res = await getAuctionList({ page_size: 100 })
  auctionList.value = res.data.list
}

const fetchBidders = async () => {
  const res = await getBidderList({ page_size: 100 })
  bidderList.value = res.data.list
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getAppointmentList({
      page: pagination.page,
      page_size: pagination.page_size,
      auction_id: searchForm.auction_id,
      date: searchForm.date,
      check_in: searchForm.check_in,
      keyword: searchForm.keyword
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  Object.keys(form).forEach(key => {
    if (key === 'visitor_count') form[key] = 1
    else form[key] = ''
  })
  form.auction_id = null
  form.bidder_id = null
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    await createAppointment(form)
    ElMessage.success('创建成功')
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    console.error(e)
  }
}

const handleCheckIn = async (row) => {
  await ElMessageBox.confirm('确认该竞买人已签到吗？', '提示', { type: 'warning' })
  await checkInAppointment(row.id)
  ElMessage.success('签到成功')
  fetchList()
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该预约吗？', '提示', { type: 'warning' })
  await deleteAppointment(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(async () => {
  await fetchAuctions()
  await fetchBidders()
  fetchList()
})
</script>

<style scoped>
.page-container {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  display: flex;
  align-items: center;
}
</style>
