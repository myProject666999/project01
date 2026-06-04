<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>拍卖会管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新建拍卖会
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input v-model="searchForm.keyword" placeholder="搜索拍卖会名称/编号" clearable style="width: 250px" @keyup.enter="fetchList" />
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 150px; margin-left: 10px">
          <el-option label="草稿" value="draft" />
          <el-option label="预展中" value="preview" />
          <el-option label="拍卖中" value="ongoing" />
          <el-option label="已结束" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-button type="primary" style="margin-left: 10px" @click="fetchList">搜索</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="auction_no" label="编号" width="120" />
        <el-table-column prop="name" label="拍卖会名称" min-width="200" />
        <el-table-column label="预展时间" width="200">
          <template #default="{ row }">
            {{ row.preview_start_date }} - {{ row.preview_end_date }}
          </template>
        </el-table-column>
        <el-table-column prop="auction_date" label="拍卖日期" width="180" />
        <el-table-column prop="auction_location" label="拍卖地点" min-width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="$router.push(`/auctions/${row.id}/lots`)">拍品管理</el-button>
            <el-button type="primary" link @click="$router.push(`/auctions/${row.id}/catalogue`)">图录排版</el-button>
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
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="拍卖会名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="拍卖会编号" prop="auction_no">
          <el-input v-model="form.auction_no" />
        </el-form-item>
        <el-form-item label="预展开始">
          <el-date-picker v-model="form.preview_start_date" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预展结束">
          <el-date-picker v-model="form.preview_end_date" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预展地点">
          <el-input v-model="form.preview_location" />
        </el-form-item>
        <el-form-item label="拍卖日期" prop="auction_date">
          <el-date-picker v-model="form.auction_date" type="datetime" style="width: 100%" />
        </el-form-item>
        <el-form-item label="拍卖地点">
          <el-input v-model="form.auction_location" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="草稿" value="draft" />
            <el-option label="预展中" value="preview" />
            <el-option label="拍卖中" value="ongoing" />
            <el-option label="已结束" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
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
import { getAuctionList, createAuction, updateAuction, deleteAuction } from '../../api'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新建拍卖会')
const formRef = ref()
const tableData = ref([])

const searchForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0
})

const form = reactive({
  id: null,
  name: '',
  auction_no: '',
  preview_start_date: '',
  preview_end_date: '',
  preview_location: '',
  auction_date: '',
  auction_location: '',
  status: 'draft',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入拍卖会名称', trigger: 'blur' }],
  auction_no: [{ required: true, message: '请输入拍卖会编号', trigger: 'blur' }],
  auction_date: [{ required: true, message: '请选择拍卖日期', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const statusType = (status) => {
  const map = { draft: 'info', preview: 'primary', ongoing: 'success', completed: '', cancelled: 'danger' }
  return map[status] || ''
}

const statusText = (status) => {
  const map = { draft: '草稿', preview: '预展中', ongoing: '拍卖中', completed: '已结束', cancelled: '已取消' }
  return map[status] || status
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getAuctionList({
      page: pagination.page,
      page_size: pagination.page_size,
      keyword: searchForm.keyword,
      status: searchForm.status
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '新建拍卖会'
  Object.keys(form).forEach(key => form[key] = key === 'status' ? 'draft' : '')
  form.id = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑拍卖会'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (form.id) {
      await updateAuction(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await createAuction(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    console.error(e)
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该拍卖会吗？', '提示', { type: 'warning' })
  await deleteAuction(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(fetchList)
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
