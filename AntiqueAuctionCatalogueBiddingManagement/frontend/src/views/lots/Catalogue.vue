<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div>
            <el-button type="primary" link @click="$router.push('/auctions')">
              <el-icon><ArrowLeft /></el-icon>返回拍卖会
            </el-button>
            <span style="margin-left: 10px; font-size: 16px; font-weight: 500;">图录排版 - {{ auction?.name || '' }}</span>
          </div>
          <div>
            <el-button type="success" @click="handleSaveOrder">
              <el-icon><Check /></el-icon>保存排序
            </el-button>
            <el-button type="primary" @click="handleExportPDF" style="margin-left: 10px">
              <el-icon><Download /></el-icon>导出PDF图录
            </el-button>
          </div>
        </div>
      </template>

      <div class="catalogue-tip">
        <el-alert title="拖拽卡片可调整拍品顺序，调整完成后点击保存排序" type="info" :closable="false" />
      </div>

      <div class="lot-grid" v-loading="loading">
        <div
          v-for="(lot, index) in lotList"
          :key="lot.id"
          class="lot-card"
          :data-id="lot.id"
          :data-index="index"
        >
          <div class="lot-card-header">
            <span class="lot-number">Lot {{ lot.lot_number }}</span>
            <span class="lot-sort">排序: {{ lot.sort_order || index + 1 }}</span>
          </div>
          <div class="lot-card-image">
            <el-icon size="48" style="color: #999;"><Picture /></el-icon>
          </div>
          <div class="lot-card-body">
            <div class="lot-name" :title="lot.name">{{ lot.name }}</div>
            <div class="lot-info">
              <span v-if="lot.era">年代: {{ lot.era }}</span>
              <span v-if="lot.category">品类: {{ lot.category }}</span>
            </div>
            <div class="lot-estimate">
              估价: ¥{{ lot.estimate_min?.toLocaleString() }} - ¥{{ lot.estimate_max?.toLocaleString() }}
            </div>
          </div>
          <div class="lot-card-footer">
            <el-button type="primary" link size="small" @click="handleEditLot(lot)">编辑</el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && lotList.length === 0" description="暂无拍品，请先添加拍品" />
    </el-card>

    <el-dialog v-model="dialogVisible" title="编辑拍品" width="700px" destroy-on-close>
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="拍品编号">
          <el-input-number v-model="form.lot_number" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="拍品名称">
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
          <el-col :span="12">
            <el-form-item label="估价下限">
              <el-input-number v-model="form.estimate_min" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="估价上限">
              <el-input-number v-model="form.estimate_max" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="来源说明">
          <el-input v-model="form.provenance" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="详细描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateLot">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import Sortable from 'sortablejs'
import { getAuction, getLotList, updateLot, updateLotSortOrder, exportCatalogue } from '../../api'

const route = useRoute()
const auctionId = computed(() => route.params.id)

const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const lotList = ref([])
const auction = ref(null)
const sortableInstance = ref(null)

const form = reactive({
  id: null,
  lot_number: 1,
  name: '',
  era: '',
  category: '',
  estimate_min: 0,
  estimate_max: 0,
  provenance: '',
  description: ''
})

const fetchAuction = async () => {
  const res = await getAuction(auctionId.value)
  auction.value = res.data
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getLotList({
      auction_id: auctionId.value,
      page: 1,
      page_size: 1000
    })
    lotList.value = res.data.list.sort((a, b) => (a.sort_order || a.lot_number) - (b.sort_order || b.lot_number))
    nextTick(() => initSortable())
  } finally {
    loading.value = false
  }
}

const initSortable = () => {
  if (sortableInstance.value) {
    sortableInstance.value.destroy()
  }
  
  const grid = document.querySelector('.lot-grid')
  if (!grid) return

  sortableInstance.value = Sortable.create(grid, {
    animation: 150,
    handle: '.lot-card',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd: (evt) => {
      const { oldIndex, newIndex } = evt
      if (oldIndex === newIndex) return
      
      const item = lotList.value.splice(oldIndex, 1)[0]
      lotList.value.splice(newIndex, 0, item)
      
      lotList.value.forEach((lot, index) => {
        lot.sort_order = index + 1
      })
    }
  })
}

const handleSaveOrder = async () => {
  const sortData = lotList.value.map((lot, index) => ({
    id: lot.id,
    sort_order: index + 1
  }))
  
  await updateLotSortOrder(sortData)
  ElMessage.success('排序已保存')
}

const handleExportPDF = () => {
  exportCatalogue(auctionId.value)
  ElMessage.success('PDF导出中，请稍候...')
}

const handleEditLot = (lot) => {
  Object.assign(form, lot)
  dialogVisible.value = true
}

const handleUpdateLot = async () => {
  await updateLot(form.id, form)
  ElMessage.success('更新成功')
  dialogVisible.value = false
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

.catalogue-tip {
  margin-bottom: 20px;
}

.lot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  min-height: 200px;
}

.lot-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: move;
  background: white;
  transition: box-shadow 0.3s;
}

.lot-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.lot-card.sortable-ghost {
  opacity: 0.5;
  background: #f0f9eb;
}

.lot-card.sortable-chosen {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.lot-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.lot-number {
  font-weight: 600;
  color: #409eff;
}

.lot-sort {
  font-size: 12px;
  color: #909399;
}

.lot-card-image {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.lot-card-body {
  padding: 15px;
}

.lot-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lot-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
}

.lot-estimate {
  font-size: 13px;
  color: #e6a23c;
  font-weight: 500;
}

.lot-card-footer {
  padding: 10px 15px;
  border-top: 1px solid #e4e7ed;
  text-align: right;
}
</style>
