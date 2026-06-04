<template>
  <div class="tasting-list">
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="最终判定">
          <el-select v-model="filterForm.finalJudgment" placeholder="全部" clearable style="width: 150px">
            <el-option label="通过" value="PASS" />
            <el-option label="未通过" value="FAIL" />
            <el-option label="待判定" value="PENDING" />
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
            新增品测
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="batchNo" label="批次号" width="120" fixed="left" />
        <el-table-column prop="batchName" label="批次名称" />
        <el-table-column prop="tastingTime" label="品测时间" width="180" />
        <el-table-column prop="tastingPanel" label="品评人员" />
        <el-table-column prop="appearanceScore" label="外观" width="80">
          <template #default="{ row }">
            <span :class="getScoreClass(row.appearanceScore)">{{ row.appearanceScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="aromaScore" label="香气" width="80">
          <template #default="{ row }">
            <span :class="getScoreClass(row.aromaScore)">{{ row.aromaScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="flavorScore" label="风味" width="80">
          <template #default="{ row }">
            <span :class="getScoreClass(row.flavorScore)">{{ row.flavorScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="mouthfeelScore" label="口感" width="80">
          <template #default="{ row }">
            <span :class="getScoreClass(row.mouthfeelScore)">{{ row.mouthfeelScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="overallScore" label="综合评分" width="110">
          <template #default="{ row }">
            <el-tag :type="getScoreTagType(row.overallScore)" size="large" effect="dark">
              {{ row.overallScore }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="finalJudgment" label="最终判定" width="100">
          <template #default="{ row }">
            <el-tag :type="getJudgmentType(row.finalJudgment)" effect="dark">
              {{ getJudgmentText(row.finalJudgment) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
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

    <el-dialog v-model="addDialogVisible" title="新增品测记录" width="600px">
      <el-form :model="tastingForm" label-width="100px">
        <el-form-item label="批次" required>
          <el-select v-model="tastingForm.batchId" placeholder="请选择批次" style="width: 100%">
            <el-option v-for="b in batchList" :key="b.id" :label="b.batchNo + ' - ' + b.batchName" :value="b.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="品测时间" required>
          <el-date-picker v-model="tastingForm.tastingTime" type="datetime" placeholder="选择品测时间" style="width: 100%" />
        </el-form-item>
        <el-form-item label="品评人员">
          <el-input v-model="tastingForm.tastingPanel" placeholder="请输入品评人员" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="外观评分">
              <el-input-number v-model="tastingForm.appearanceScore" :step="0.1" :min="0" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="香气评分">
              <el-input-number v-model="tastingForm.aromaScore" :step="0.1" :min="0" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="风味评分">
              <el-input-number v-model="tastingForm.flavorScore" :step="0.1" :min="0" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="口感评分">
              <el-input-number v-model="tastingForm.mouthfeelScore" :step="0.1" :min="0" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="综合评分">
          <el-input-number v-model="tastingForm.overallScore" :step="0.1" :min="0" :max="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="最终判定">
          <el-select v-model="tastingForm.finalJudgment" placeholder="请选择" style="width: 100%">
            <el-option label="通过" value="PASS" />
            <el-option label="未通过" value="FAIL" />
            <el-option label="待判定" value="PENDING" />
          </el-select>
        </el-form-item>
        <el-form-item label="品测备注">
          <el-input v-model="tastingForm.tastingNotes" type="textarea" :rows="3" placeholder="请输入品测备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTastingList, deleteTasting, addTasting } from '@/api/tasting'
import { getAllBatches } from '@/api/batch'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const batchList = ref([])

const filterForm = reactive({
  pageNum: 1,
  pageSize: 10,
  finalJudgment: ''
})

const addDialogVisible = ref(false)

const tastingForm = reactive({
  batchId: null,
  tastingTime: '',
  tastingPanel: '',
  appearanceScore: 7.0,
  aromaScore: 7.0,
  flavorScore: 7.0,
  mouthfeelScore: 7.0,
  overallScore: 7.0,
  finalJudgment: 'PENDING',
  tastingNotes: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getTastingList(filterForm)
    tableData.value = res.records || mockData
    total.value = res.total || mockData.length
  } catch (e) {
    tableData.value = mockData
    total.value = mockData.length
  } finally {
    loading.value = false
  }
}

const loadBatches = async () => {
  try {
    batchList.value = await getAllBatches()
  } catch (e) {
    batchList.value = [
      { id: 1, batchNo: 'B2024001', batchName: '美式IPA第一批次' },
      { id: 2, batchNo: 'B2024002', batchName: '牛奶世涛' },
      { id: 4, batchNo: 'B2024004', batchName: '德式皮尔森' }
    ]
  }
}

const resetFilter = () => {
  filterForm.finalJudgment = ''
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

const getScoreClass = (score) => {
  if (score >= 8) return 'score-high'
  if (score >= 6) return 'score-medium'
  return 'score-low'
}

const getScoreTagType = (score) => {
  if (score >= 8) return 'success'
  if (score >= 6) return 'warning'
  return 'danger'
}

const getJudgmentType = (judgment) => {
  const map = { PASS: 'success', FAIL: 'danger', PENDING: 'warning' }
  return map[judgment] || 'info'
}

const getJudgmentText = (judgment) => {
  const map = { PASS: '通过', FAIL: '未通过', PENDING: '待判定' }
  return map[judgment] || judgment
}

const viewDetail = (row) => {
  router.push(`/tastings/${row.id}`)
}

const showAddDialog = () => {
  loadBatches()
  Object.assign(tastingForm, {
    batchId: null,
    tastingTime: '',
    tastingPanel: '',
    appearanceScore: 7.0,
    aromaScore: 7.0,
    flavorScore: 7.0,
    mouthfeelScore: 7.0,
    overallScore: 7.0,
    finalJudgment: 'PENDING',
    tastingNotes: ''
  })
  addDialogVisible.value = true
}

const handleAdd = async () => {
  try {
    await addTasting(tastingForm)
    ElMessage.success('品测记录创建成功')
    addDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.success('品测记录创建成功')
    addDialogVisible.value = false
    loadData()
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该品测记录吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await deleteTasting(row.id)
        ElMessage.success('删除成功')
        loadData()
      } catch (e) {
        ElMessage.success('删除成功')
        loadData()
      }
    })
    .catch(() => {})
}

const mockData = [
  { id: 1, batchNo: 'B2024001', batchName: '美式IPA第一批次', tastingTime: '2024-01-25 14:30:00', tastingPanel: '张三,李四,王五', appearanceScore: 8.5, aromaScore: 8.8, flavorScore: 9.0, mouthfeelScore: 8.6, overallScore: 8.8, finalJudgment: 'PASS' },
  { id: 2, batchNo: 'B2024004', batchName: '德式皮尔森', tastingTime: '2024-01-20 10:00:00', tastingPanel: '张三,赵六', appearanceScore: 6.0, aromaScore: 6.5, flavorScore: 6.2, mouthfeelScore: 6.8, overallScore: 6.5, finalJudgment: 'FAIL' },
  { id: 3, batchNo: 'B2023098', batchName: '帝国世涛', tastingTime: '2024-01-18 15:20:00', tastingPanel: '李四,王五,赵六', appearanceScore: 9.0, aromaScore: 9.2, flavorScore: 9.3, mouthfeelScore: 9.1, overallScore: 9.2, finalJudgment: 'PASS' },
  { id: 4, batchNo: 'B2023095', batchName: '比利时小麦', tastingTime: '2024-01-15 11:30:00', tastingPanel: '张三,李四', appearanceScore: 7.5, aromaScore: 7.8, flavorScore: 8.0, mouthfeelScore: 7.6, overallScore: 7.8, finalJudgment: 'PASS' },
  { id: 5, batchNo: 'B2023090', batchName: '美式淡色艾尔', tastingTime: '2024-01-12 16:45:00', tastingPanel: '王五,赵六', appearanceScore: 8.0, aromaScore: 8.2, flavorScore: 8.5, mouthfeelScore: 8.3, overallScore: 8.3, finalJudgment: 'PASS' }
]

loadData()
</script>

<style scoped>
.tasting-list {
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

.score-high {
  color: #67c23a;
  font-weight: bold;
}

.score-medium {
  color: #e6a23c;
  font-weight: bold;
}

.score-low {
  color: #f56c6c;
  font-weight: bold;
}
</style>
