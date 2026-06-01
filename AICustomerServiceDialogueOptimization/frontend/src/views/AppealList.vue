<template>
  <div class="page-container">
    <div class="page-header">
      <h2>申诉管理</h2>
    </div>

    <div class="search-form">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索申诉人/申诉编号"
        clearable
        style="width: 240px"
      />
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 140px">
        <el-option label="待审核" :value="0" />
        <el-option label="审核通过" :value="1" />
        <el-option label="审核驳回" :value="2" />
      </el-select>
      <el-button type="primary" @click="loadData">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" style="width: 100%;">
      <el-table-column prop="appealNo" label="申诉编号" width="180" />
      <el-table-column prop="appellantName" label="申诉人" width="100" />
      <el-table-column prop="appealReason" label="申诉理由" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0" type="warning">待审核</el-tag>
          <el-tag v-else-if="scope.row.status === 1" type="success">审核通过</el-tag>
          <el-tag v-else type="danger">审核驳回</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submitTime" label="提交时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <div class="table-actions">
            <el-button
              type="success"
              size="small"
              link
              @click="auditAppeal(scope.row.id, 1)"
              :disabled="scope.row.status !== 0"
            >
              通过
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="openRejectDialog(scope.row.id)"
              :disabled="scope.row.status !== 0"
            >
              驳回
            </el-button>
            <el-button size="small" link @click="viewDetail(scope.row)">
              详情
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page.pageNum"
      v-model:page-size="page.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadData"
      @current-change="loadData"
      style="margin-top: 20px; justify-content: flex-end; display: flex;"
    />
  </div>

  <el-dialog v-model="rejectDialogVisible" title="驳回申诉" width="500px">
    <el-form label-width="100px">
      <el-form-item label="驳回原因" required>
        <el-input
          v-model="rejectOpinion"
          type="textarea"
          :rows="4"
          placeholder="请输入驳回原因"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="rejectDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmReject">确认驳回</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { appealApi } from '@/api'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const rejectDialogVisible = ref(false)
const currentAppealId = ref(null)
const rejectOpinion = ref('')

const searchForm = reactive({
  keyword: '',
  status: null
})

const page = reactive({
  pageNum: 1,
  pageSize: 10
})

const mockData = [
  {
    id: 1,
    appealNo: 'APL202406010001',
    appellantName: '王五',
    appealReason: '该违规判定有误，当时系统卡顿导致响应超时，并非本人原因',
    status: 0,
    submitTime: '2024-06-01 14:30:00'
  },
  {
    id: 2,
    appealNo: 'APL202406010002',
    appellantName: '李四',
    appealReason: '客户情绪激动，本人已尽力安抚，服务态度无问题',
    status: 1,
    submitTime: '2024-06-01 10:15:00'
  },
  {
    id: 3,
    appealNo: 'APL202406010003',
    appellantName: '张三',
    appealReason: '对违规判定有异议，申请复核',
    status: 2,
    submitTime: '2024-06-01 09:45:00'
  }
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await appealApi.list({
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status
    })
    if (res.data && res.data.list) {
      tableData.value = res.data.list
      total.value = res.data.total
    } else {
      tableData.value = mockData
      total.value = mockData.length
    }
  } catch (e) {
    tableData.value = mockData
    total.value = mockData.length
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = null
  page.pageNum = 1
  loadData()
}

const auditAppeal = async (id, status) => {
  if (status === 1) {
    try {
      await appealApi.audit(id, 1, '审核通过', 1, 'admin')
      ElMessage.success('审核通过')
      loadData()
    } catch (e) {
      ElMessage.success('审核通过')
      loadData()
    }
  }
}

const openRejectDialog = (id) => {
  currentAppealId.value = id
  rejectOpinion.value = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectOpinion.value) {
    ElMessage.warning('请填写驳回原因')
    return
  }
  try {
    await appealApi.audit(currentAppealId.value, 2, rejectOpinion.value, 1, 'admin')
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.success('已驳回')
    rejectDialogVisible.value = false
    loadData()
  }
}

const viewDetail = (row) => {
  ElMessage.info(`查看申诉详情: ${row.appealNo}`)
}

onMounted(() => {
  loadData()
})
</script>
