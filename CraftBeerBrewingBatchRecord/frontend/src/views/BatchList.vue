<template>
  <div class="batch-list">
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="搜索批次号/名称" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="批次状态">
          <el-select v-model="filterForm.batchStatus" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="酿造中" value="BREWING" />
            <el-option label="发酵中" value="FERMENTING" />
            <el-option label="装瓶" value="BOTTLED" />
            <el-option label="完成" value="COMPLETED" />
          </el-select>
        </el-form-item>
        <el-form-item label="质量状态">
          <el-select v-model="filterForm.qualityStatus" placeholder="全部" clearable style="width: 150px">
            <el-option label="合格" value="QUALIFIED" />
            <el-option label="不合格" value="UNQUALIFIED" />
            <el-option label="待评定" value="PENDING" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="success" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            新建批次
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="batchNo" label="批次号" width="120" fixed="left" />
        <el-table-column prop="batchName" label="批次名称" min-width="160" />
        <el-table-column prop="recipeName" label="使用配方" />
        <el-table-column prop="brewer" label="酿酒师" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="160" />
        <el-table-column prop="endTime" label="结束时间" width="160" />
        <el-table-column prop="actualBatchSize" label="实际容量(L)" width="120" />
        <el-table-column prop="batchStatus" label="批次状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.batchStatus)" effect="light">
              {{ getStatusText(row.batchStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qualityStatus" label="质量状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getQualityType(row.qualityStatus)" effect="dark">
              {{ getQualityText(row.qualityStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
            <el-button type="info" link @click="viewTemperature(row)">温度曲线</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page="filterForm.pageNum"
        :page-size="filterForm.pageSize"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <el-dialog v-model="addDialogVisible" title="新建批次" width="600px">
      <el-form :model="batchForm" label-width="100px">
        <el-form-item label="批次号" required>
          <el-input v-model="batchForm.batchNo" placeholder="自动生成或手动输入" />
        </el-form-item>
        <el-form-item label="批次名称" required>
          <el-input v-model="batchForm.batchName" placeholder="请输入批次名称" />
        </el-form-item>
        <el-form-item label="使用配方" required>
          <el-select v-model="batchForm.recipeId" placeholder="请选择配方" style="width: 100%">
            <el-option v-for="r in recipeList" :key="r.id" :label="r.recipeName" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="酿酒师">
          <el-input v-model="batchForm.brewer" placeholder="请输入酿酒师姓名" />
        </el-form-item>
        <el-form-item label="批次容量">
          <el-input-number v-model="batchForm.actualBatchSize" :step="5" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="batchForm.notes" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">创建批次</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBatchList, deleteBatch, addBatch } from '@/api/batch'
import { getAllRecipes } from '@/api/recipe'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const recipeList = ref([])

const filterForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  batchStatus: '',
  qualityStatus: ''
})

const addDialogVisible = ref(false)

const batchForm = reactive({
  batchNo: '',
  batchName: '',
  recipeId: null,
  brewer: '',
  actualBatchSize: 50,
  notes: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getBatchList(filterForm)
    tableData.value = res.records || mockData
    total.value = res.total || mockData.length
  } catch (e) {
    tableData.value = mockData
    total.value = mockData.length
  } finally {
    loading.value = false
  }
}

const loadRecipes = async () => {
  try {
    recipeList.value = await getAllRecipes()
  } catch (e) {
    recipeList.value = [
      { id: 1, recipeName: '经典美式IPA' },
      { id: 2, recipeName: '牛奶世涛' },
      { id: 3, recipeName: '比利时小麦' }
    ]
  }
}

const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.batchStatus = ''
  filterForm.qualityStatus = ''
  filterForm.pageNum = 1
  loadData()
}

const handlePageChange = (page) => {
  filterForm.pageNum = page
  loadData()
}

const handleSizeChange = (size) => {
  filterForm.pageSize = size
  filterForm.pageNum = 1
  loadData()
}

const getStatusType = (status) => {
  const map = { BREWING: 'primary', FERMENTING: 'warning', BOTTLED: 'success', COMPLETED: 'info' }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = { BREWING: '酿造中', FERMENTING: '发酵中', BOTTLED: '装瓶', COMPLETED: '完成' }
  return map[status] || status
}

const getQualityType = (status) => {
  const map = { QUALIFIED: 'success', UNQUALIFIED: 'danger', PENDING: 'warning' }
  return map[status] || 'info'
}

const getQualityText = (status) => {
  const map = { QUALIFIED: '合格', UNQUALIFIED: '不合格', PENDING: '待评定' }
  return map[status] || status
}

const viewDetail = (row) => {
  router.push(`/batches/${row.id}`)
}

const viewTemperature = (row) => {
  router.push('/temperature')
}

const showAddDialog = () => {
  loadRecipes()
  Object.assign(batchForm, {
    batchNo: 'B' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
    batchName: '',
    recipeId: null,
    brewer: '',
    actualBatchSize: 50,
    notes: ''
  })
  addDialogVisible.value = true
}

const handleAdd = async () => {
  try {
    await addBatch(batchForm)
    ElMessage.success('批次创建成功')
    addDialogVisible.value = false
    loadData()
  } catch (e) {
    console.error('创建批次失败:', e)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该批次吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await deleteBatch(row.id)
        ElMessage.success('删除成功')
        loadData()
      } catch (e) {
        console.error('删除批次失败:', e)
      }
    })
    .catch(() => {})
}

const mockData = [
  { id: 1, batchNo: 'B2024001', batchName: '美式IPA第一批次', recipeName: '经典美式IPA', brewer: '张师傅', startTime: '2024-01-10 08:00:00', endTime: '2024-01-25 16:00:00', actualBatchSize: 48.5, batchStatus: 'COMPLETED', qualityStatus: 'QUALIFIED' },
  { id: 2, batchNo: 'B2024002', batchName: '牛奶世涛', recipeName: '牛奶世涛', brewer: '李师傅', startTime: '2024-01-12 09:00:00', endTime: null, actualBatchSize: 50, batchStatus: 'FERMENTING', qualityStatus: 'PENDING' },
  { id: 3, batchNo: 'B2024003', batchName: '比利时小麦', recipeName: '比利时小麦', brewer: '王师傅', startTime: '2024-01-15 08:30:00', endTime: null, actualBatchSize: 50, batchStatus: 'BREWING', qualityStatus: 'PENDING' },
  { id: 4, batchNo: 'B2024004', batchName: '德式皮尔森', recipeName: '德式皮尔森', brewer: '张师傅', startTime: '2024-01-05 08:00:00', endTime: '2024-01-20 15:00:00', actualBatchSize: 49.2, batchStatus: 'COMPLETED', qualityStatus: 'UNQUALIFIED' },
  { id: 5, batchNo: 'B2024005', batchName: '樱桃酸啤', recipeName: '樱桃酸啤', brewer: '李师傅', startTime: '2024-01-08 10:00:00', endTime: null, actualBatchSize: 30, batchStatus: 'BOTTLED', qualityStatus: 'PENDING' }
]

loadData()
</script>

<style scoped>
.batch-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card {
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
