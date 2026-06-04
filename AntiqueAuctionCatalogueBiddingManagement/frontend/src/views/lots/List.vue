<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div>
            <el-button type="primary" link @click="$router.push('/auctions')">
              <el-icon><ArrowLeft /></el-icon>返回拍卖会
            </el-button>
            <span style="margin-left: 10px; font-size: 16px; font-weight: 500;">拍品管理 - {{ auction?.name || '' }}</span>
          </div>
          <div>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>添加拍品
            </el-button>
          </div>
        </div>
      </template>

      <div class="search-bar">
        <el-input v-model="searchForm.keyword" placeholder="搜索拍品名称/编号" clearable style="width: 250px" @keyup.enter="fetchList" />
        <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 150px; margin-left: 10px">
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
          <el-option label="已成交" value="sold" />
          <el-option label="流拍" value="unsold" />
        </el-select>
        <el-button type="primary" style="margin-left: 10px" @click="fetchList">搜索</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading" row-key="id">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="lot_number" label="拍品号" width="100" />
        <el-table-column prop="name" label="拍品名称" min-width="200" />
        <el-table-column prop="era" label="年代" width="120" />
        <el-table-column prop="category" label="品类" width="120" />
        <el-table-column label="估价" width="180">
          <template #default="{ row }">
            ¥{{ row.estimate_min?.toLocaleString() }} - ¥{{ row.estimate_max?.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column v-if="isAdmin" label="保留价" width="120">
          <template #default="{ row }">
            <span v-if="row.reserve_price">¥{{ row.reserve_price?.toLocaleString() }}</span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="拍品编号" prop="lot_number">
              <el-input-number v-model="form.lot_number" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="待审核" value="pending" />
                <el-option label="已通过" value="approved" />
                <el-option label="已拒绝" value="rejected" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="拍品名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年代">
              <el-input v-model="form.era" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品类">
              <el-input v-model="form.category" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="估价下限" prop="estimate_min">
              <el-input-number v-model="form.estimate_min" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="估价上限" prop="estimate_max">
              <el-input-number v-model="form.estimate_max" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="保留价">
              <el-input-number v-model="form.reserve_price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="尺寸">
              <el-input v-model="form.dimensions" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="材质">
              <el-input v-model="form.material" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="来源说明">
          <el-input v-model="form.provenance" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="详细描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="品相说明">
          <el-input v-model="form.condition_note" type="textarea" :rows="2" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAuction, getLotList, createLot, updateLot, deleteLot } from '../../api'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const userStore = useUserStore()
const auctionId = computed(() => route.params.id)
const isAdmin = computed(() => userStore.isAdmin)

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加拍品')
const formRef = ref()
const tableData = ref([])
const auction = ref(null)

const searchForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const form = reactive({
  id: null,
  auction_id: null,
  lot_number: 1,
  name: '',
  era: '',
  category: '',
  estimate_min: 0,
  estimate_max: 0,
  reserve_price: null,
  provenance: '',
  description: '',
  dimensions: '',
  material: '',
  condition_note: '',
  sort_order: 0,
  status: 'pending'
})

const rules = {
  lot_number: [{ required: true, message: '请输入拍品编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入拍品名称', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const statusType = (status) => {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger', sold: 'primary', unsold: 'info' }
  return map[status] || ''
}

const statusText = (status) => {
  const map = { pending: '待审核', approved: '已通过', rejected: '已拒绝', sold: '已成交', unsold: '流拍' }
  return map[status] || status
}

const fetchAuction = async () => {
  const res = await getAuction(auctionId.value)
  auction.value = res.data
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getLotList({
      auction_id: auctionId.value,
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
  dialogTitle.value = '添加拍品'
  Object.keys(form).forEach(key => {
    if (['estimate_min', 'estimate_max'].includes(key)) form[key] = 0
    else if (key === 'lot_number') form[key] = tableData.value.length + 1
    else if (key === 'auction_id') form[key] = parseInt(auctionId.value)
    else if (key === 'status') form[key] = 'pending'
    else form[key] = ''
  })
  form.id = null
  form.reserve_price = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑拍品'
  Object.assign(form, row)
  form.auction_id = parseInt(auctionId.value)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (form.id) {
      await updateLot(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await createLot(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    console.error(e)
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该拍品吗？', '提示', { type: 'warning' })
  await deleteLot(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(async () => {
  await fetchAuction()
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
