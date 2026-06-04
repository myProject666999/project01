<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>拍卖结果管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>录入结果
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-select v-model="searchForm.auction_id" placeholder="选择拍卖会" clearable style="width: 250px" @change="fetchList">
          <el-option v-for="auc in auctionList" :key="auc.id" :label="auc.name" :value="auc.id" />
        </el-select>
        <el-select v-model="searchForm.is_unsold" placeholder="成交状态" clearable style="width: 120px; margin-left: 10px" @change="fetchList">
          <el-option label="已成交" :value="0" />
          <el-option label="流拍" :value="1" />
        </el-select>
        <el-button type="primary" style="margin-left: 10px" @click="fetchList">搜索</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%; margin-top: 20px" v-loading="loading">
        <el-table-column prop="lot_number" label="拍品号" width="100" />
        <el-table-column prop="lot_name" label="拍品名称" min-width="200" />
        <el-table-column label="估价" width="180">
          <template #default="{ row }">
            ¥{{ row.estimate_min?.toLocaleString() }} - ¥{{ row.estimate_max?.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="hammer_price" label="落槌价" width="150">
          <template #default="{ row }">
            <span v-if="!row.is_unsold" style="color: #67c23a; font-weight: 500;">
              ¥{{ row.hammer_price?.toLocaleString() }}
            </span>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="buyer_paddle_number" label="买受人号牌" width="120">
          <template #default="{ row }">
            {{ row.buyer_paddle_number || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="is_unsold" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_unsold ? 'info' : 'success'">
              {{ row.is_unsold ? '流拍' : '成交' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column label="操作" width="150" fixed="right">
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="拍卖会" prop="auction_id">
              <el-select v-model="form.auction_id" style="width: 100%" @change="onAuctionChange">
                <el-option v-for="auc in auctionList" :key="auc.id" :label="auc.name" :value="auc.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="拍品" prop="lot_id">
              <el-select v-model="form.lot_id" filterable style="width: 100%">
                <el-option v-for="lot in lotList" :key="lot.id" :label="'Lot' + lot.lot_number + ' - ' + lot.name" :value="lot.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="是否流拍">
          <el-radio-group v-model="form.is_unsold">
            <el-radio :value="0">成交</el-radio>
            <el-radio :value="1">流拍</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-row :gutter="20" v-if="!form.is_unsold">
          <el-col :span="12">
            <el-form-item label="落槌价" prop="hammer_price">
              <el-input-number v-model="form.hammer_price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="买受人" prop="buyer_qualification_id">
              <el-select v-model="form.buyer_qualification_id" filterable style="width: 100%" @change="onBuyerChange">
                <el-option v-for="q in qualificationList" :key="q.id" :label="'号牌' + q.paddle_number + ' - ' + q.bidder.name" :value="q.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
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
import { getResultList, createResult, updateResult, deleteResult, getAuctionList, getLotList, getQualificationList } from '../../api'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('录入拍卖结果')
const formRef = ref()
const tableData = ref([])
const auctionList = ref([])
const lotList = ref([])
const qualificationList = ref([])

const searchForm = reactive({
  auction_id: '',
  is_unsold: ''
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const form = reactive({
  id: null,
  auction_id: null,
  lot_id: null,
  hammer_price: 0,
  buyer_paddle_number: '',
  buyer_qualification_id: null,
  is_unsold: 0,
  remark: ''
})

const rules = {
  auction_id: [{ required: true, message: '请选择拍卖会', trigger: 'change' }],
  lot_id: [{ required: true, message: '请选择拍品', trigger: 'change' }]
}

const fetchAuctions = async () => {
  const res = await getAuctionList({ page_size: 100 })
  auctionList.value = res.data.list
}

const fetchLots = async (auctionId) => {
  if (!auctionId) {
    lotList.value = []
    return
  }
  const res = await getLotList({ auction_id: auctionId, page_size: 1000 })
  lotList.value = res.data.list.filter(l => l.status === 'approved' || l.status === 'sold' || l.status === 'unsold')
}

const fetchQualifications = async (auctionId) => {
  if (!auctionId) {
    qualificationList.value = []
    return
  }
  const res = await getQualificationList({ auction_id: auctionId, qualification_status: 'approved', page_size: 100 })
  qualificationList.value = res.data.list
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getResultList({
      page: pagination.page,
      page_size: pagination.page_size,
      auction_id: searchForm.auction_id,
      is_unsold: searchForm.is_unsold
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } finally {
    loading.value = false
  }
}

const onAuctionChange = (val) => {
  fetchLots(val)
  fetchQualifications(val)
}

const onBuyerChange = (val) => {
  const q = qualificationList.value.find(item => item.id === val)
  if (q) {
    form.buyer_paddle_number = q.paddle_number
  }
}

const handleAdd = () => {
  dialogTitle.value = '录入拍卖结果'
  Object.keys(form).forEach(key => {
    if (['hammer_price', 'is_unsold'].includes(key)) form[key] = 0
    else form[key] = ''
  })
  form.id = null
  form.auction_id = null
  form.lot_id = null
  form.buyer_qualification_id = null
  lotList.value = []
  qualificationList.value = []
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑拍卖结果'
  Object.assign(form, row)
  fetchLots(row.auction_id)
  fetchQualifications(row.auction_id)
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (form.id) {
      await updateResult(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await createResult(form)
      ElMessage.success('录入成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    console.error(e)
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该记录吗？', '提示', { type: 'warning' })
  await deleteResult(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(async () => {
  await fetchAuctions()
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
