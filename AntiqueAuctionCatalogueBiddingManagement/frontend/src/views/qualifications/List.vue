<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>资格审核管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>添加资格申请
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-select v-model="searchForm.auction_id" placeholder="选择拍卖会" clearable style="width: 200px" @change="fetchList">
          <el-option v-for="auc in auctionList" :key="auc.id" :label="auc.name" :value="auc.id" />
        </el-select>
        <el-select v-model="searchForm.qualification_status" placeholder="审核状态" clearable style="width: 150px; margin-left: 10px" @change="fetchList">
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
        <el-input v-model="searchForm.keyword" placeholder="搜索竞买人/号牌" clearable style="width: 200px; margin-left: 10px" @keyup.enter="fetchList" />
        <el-button type="primary" style="margin-left: 10px" @click="fetchList">搜索</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="paddle_number" label="号牌" width="100" />
        <el-table-column prop="bidder.name" label="竞买人" width="120" />
        <el-table-column prop="bidder.phone" label="电话" width="130" />
        <el-table-column prop="deposit_amount" label="保证金" width="120">
          <template #default="{ row }">¥{{ row.deposit_amount?.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="审核项" width="200">
          <template #default="{ row }">
            <el-tag :type="row.deposit_paid ? 'success' : 'danger'">保证金</el-tag>
            <el-tag :type="row.id_verified ? 'success' : 'danger'" style="margin-left: 5px;">身份证</el-tag>
            <el-tag :type="row.bank_statement_verified ? 'success' : 'danger'" style="margin-left: 5px;">流水</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="high_value_bidder" label="高价竞买人" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.high_value_bidder" type="warning">是</el-tag>
            <span v-else style="color: #999">否</span>
          </template>
        </el-table-column>
        <el-table-column prop="qualification_status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.qualification_status)">{{ statusText(row.qualification_status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.qualification_status === 'pending'" type="success" link @click="handleReview(row, 'approved')">通过</el-button>
            <el-button v-if="row.qualification_status === 'pending'" type="danger" link @click="handleReview(row, 'rejected')">拒绝</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="拍卖会" prop="auction_id">
              <el-select v-model="form.auction_id" style="width: 100%">
                <el-option v-for="auc in auctionList" :key="auc.id" :label="auc.name" :value="auc.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="竞买人" prop="bidder_id">
              <el-select v-model="form.bidder_id" filterable style="width: 100%">
                <el-option v-for="bidder in bidderList" :key="bidder.id" :label="bidder.name + ' - ' + bidder.phone" :value="bidder.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="号牌号码">
            <el-input v-model="form.paddle_number" placeholder="自动生成则留空" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保证金金额" prop="deposit_amount">
              <el-input-number v-model="form.deposit_amount" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="审核状态">
          <el-checkbox v-model="form.deposit_paid">保证金已缴纳</el-checkbox>
          <el-checkbox v-model="form.id_verified" style="margin-left: 20px;">身份证已验证</el-checkbox>
          <el-checkbox v-model="form.bank_statement_verified" style="margin-left: 20px;">银行流水已验证</el-checkbox>
          <el-checkbox v-model="form.high_value_bidder" style="margin-left: 20px;">高价竞买人</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="reviewDialogVisible" title="审核拒绝" width="500px">
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item label="拒绝原因">
          <el-input v-model="reviewForm.reject_reason" type="textarea" :rows="4" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getQualificationList, createQualification, updateQualification, deleteQualification,
  reviewQualification, getAuctionList, getBidderList } from '../../api'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加资格申请')
const reviewDialogVisible = ref(false)
const formRef = ref()
const tableData = ref([])
const auctionList = ref([])
const bidderList = ref([])
const currentReviewRow = ref(null)

const searchForm = reactive({
  auction_id: '',
  qualification_status: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const form = reactive({
  id: null,
  auction_id: null,
  bidder_id: null,
  paddle_number: '',
  deposit_amount: 0,
  deposit_paid: 0,
  id_verified: 0,
  bank_statement_verified: 0,
  high_value_bidder: 0
})

const reviewForm = reactive({
  reject_reason: ''
})

const rules = {
  auction_id: [{ required: true, message: '请选择拍卖会', trigger: 'change' }],
  bidder_id: [{ required: true, message: '请选择竞买人', trigger: 'change' }]
}

const statusType = (status) => {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger' }
  return map[status] || ''
}

const statusText = (status) => {
  const map = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
  return map[status] || status
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN')
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
    const res = await getQualificationList({
      page: pagination.page,
      page_size: pagination.page_size,
      auction_id: searchForm.auction_id,
      qualification_status: searchForm.qualification_status,
      keyword: searchForm.keyword
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '添加资格申请'
  Object.keys(form).forEach(key => {
    if (['deposit_amount'].includes(key)) form[key] = 0
    else form[key] = ''
  })
  form.id = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑资格申请'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (form.id) {
      await updateQualification(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await createQualification(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    console.error(e)
  }
}

const handleReview = (row, status) => {
  if (status === 'approved') {
    ElMessageBox.confirm('确定通过该资格申请吗？', '提示', { type: 'warning' }).then(async () => {
      await reviewQualification(row.id, { qualification_status: 'approved', reject_reason: '' })
      ElMessage.success('审核通过')
      fetchList()
    })
  } else {
    currentReviewRow.value = row
    reviewForm.reject_reason = ''
    reviewDialogVisible.value = true
  }
}

const confirmReject = async () => {
  await reviewQualification(currentReviewRow.value.id, { 
    qualification_status: 'rejected', reject_reason: reviewForm.reject_reason })
  reviewDialogVisible.value = false
  ElMessage.success('已拒绝')
  fetchList()
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该申请吗？', '提示', { type: 'warning' })
  await deleteQualification(row.id)
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
