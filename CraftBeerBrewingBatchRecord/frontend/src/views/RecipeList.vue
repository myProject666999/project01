<template>
  <div class="recipe-list">
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="搜索配方名称/编号" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="啤酒风格">
          <el-select v-model="filterForm.beerStyle" placeholder="全部风格" clearable style="width: 180px">
            <el-option label="IPA" value="IPA" />
            <el-option label="世涛" value="STOUT" />
            <el-option label="小麦" value="WHEAT" />
            <el-option label="皮尔森" value="PILSNER" />
            <el-option label="酸啤" value="SOUR" />
            <el-option label="艾尔" value="ALE" />
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
            新建配方
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="recipeCode" label="配方编号" width="120" />
        <el-table-column prop="recipeName" label="配方名称" min-width="160" />
        <el-table-column prop="version" label="版本" width="80">
          <template #default="{ row }">
            <el-tag type="warning" effect="plain">V{{ row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="beerStyle" label="啤酒风格" width="100">
          <template #default="{ row }">
            <el-tag :type="getStyleType(row.beerStyle)">{{ row.beerStyle }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetAbv" label="目标酒精度" width="120" />
        <el-table-column prop="targetIbu" label="目标IBU" width="100" />
        <el-table-column prop="batchSizeLiters" label="批次容量(L)" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
            <el-button type="success" link @click="showVersionDialog(row)">创建新版本</el-button>
            <el-button type="info" link @click="showHistoryDialog(row)">历史版本</el-button>
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

    <el-dialog v-model="addDialogVisible" title="新建配方" width="600px">
      <el-form :model="recipeForm" label-width="100px">
        <el-form-item label="配方编号" required>
          <el-input v-model="recipeForm.recipeCode" placeholder="请输入配方编号" />
        </el-form-item>
        <el-form-item label="配方名称" required>
          <el-input v-model="recipeForm.recipeName" placeholder="请输入配方名称" />
        </el-form-item>
        <el-form-item label="啤酒风格" required>
          <el-select v-model="recipeForm.beerStyle" placeholder="请选择风格" style="width: 100%">
            <el-option label="IPA" value="IPA" />
            <el-option label="世涛" value="STOUT" />
            <el-option label="小麦" value="WHEAT" />
            <el-option label="皮尔森" value="PILSNER" />
            <el-option label="酸啤" value="SOUR" />
            <el-option label="艾尔" value="ALE" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标酒精度">
              <el-input-number v-model="recipeForm.targetAbv" :step="0.1" :min="0" :max="20" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标IBU">
              <el-input-number v-model="recipeForm.targetIbu" :step="1" :min="0" :max="120" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标OG">
              <el-input-number v-model="recipeForm.targetOg" :step="0.001" :min="1" :max="1.2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标FG">
              <el-input-number v-model="recipeForm.targetFg" :step="0.001" :min="1" :max="1.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="批次容量">
          <el-input-number v-model="recipeForm.batchSizeLiters" :step="5" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="recipeForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="versionDialogVisible" title="创建新版本" width="500px">
      <div class="version-info">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="当前配方">
            {{ currentRecipe?.recipeName }} ({{ currentRecipe?.recipeCode }})
          </el-descriptions-item>
          <el-descriptions-item label="当前版本">
            <el-tag type="warning">V{{ currentRecipe?.version }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="新版本">
            <el-tag type="success">V{{ (currentRecipe?.version || 0) + 1 }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <el-form :model="versionForm" label-width="100px" style="margin-top: 20px">
        <el-form-item label="版本说明">
          <el-input v-model="versionForm.description" type="textarea" :rows="3" placeholder="请输入版本变更说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="versionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateVersion">创建新版本</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="historyDialogVisible" title="历史版本" width="600px">
      <el-table :data="historyData" stripe>
        <el-table-column prop="version" label="版本" width="80">
          <template #default="{ row }">
            <el-tag :type="row.version === currentRecipe?.version ? 'success' : 'info'">V{{ row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recipeName" label="配方名称" />
        <el-table-column prop="targetAbv" label="酒精度" />
        <el-table-column prop="targetIbu" label="IBU" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRecipeList, deleteRecipe, getRecipeHistory, createNewVersion, addRecipe } from '@/api/recipe'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const filterForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  beerStyle: ''
})

const addDialogVisible = ref(false)
const versionDialogVisible = ref(false)
const historyDialogVisible = ref(false)

const currentRecipe = ref(null)
const historyData = ref([])

const recipeForm = reactive({
  recipeCode: '',
  recipeName: '',
  beerStyle: '',
  targetAbv: 5.0,
  targetIbu: 30,
  targetOg: 1.050,
  targetFg: 1.010,
  batchSizeLiters: 50,
  description: '',
  recipeMaterials: []
})

const versionForm = reactive({
  description: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRecipeList(filterForm)
    tableData.value = res.records || mockData
    total.value = res.total || mockData.length
  } catch (e) {
    tableData.value = mockData
    total.value = mockData.length
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.beerStyle = ''
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

const getStyleType = (style) => {
  const map = { IPA: 'danger', STOUT: 'info', WHEAT: 'warning', PILSNER: 'success', SOUR: 'primary', ALE: '' }
  return map[style] || ''
}

const viewDetail = (row) => {
  router.push(`/recipes/${row.id}`)
}

const showAddDialog = () => {
  Object.assign(recipeForm, {
    recipeCode: '',
    recipeName: '',
    beerStyle: '',
    targetAbv: 5.0,
    targetIbu: 30,
    targetOg: 1.050,
    targetFg: 1.010,
    batchSizeLiters: 50,
    description: ''
  })
  addDialogVisible.value = true
}

const handleAdd = async () => {
  try {
    await addRecipe(recipeForm)
    ElMessage.success('配方创建成功')
    addDialogVisible.value = false
    loadData()
  } catch (e) {
    console.error('创建配方失败:', e)
  }
}

const showVersionDialog = (row) => {
  currentRecipe.value = row
  versionForm.description = ''
  versionDialogVisible.value = true
}

const handleCreateVersion = async () => {
  try {
    await createNewVersion({
      ...currentRecipe.value,
      description: versionForm.description
    })
    ElMessage.success('新版本创建成功')
    versionDialogVisible.value = false
    loadData()
  } catch (e) {
    console.error('创建新版本失败:', e)
  }
}

const showHistoryDialog = async (row) => {
  currentRecipe.value = row
  try {
    historyData.value = await getRecipeHistory(row.recipeCode)
  } catch (e) {
    historyData.value = mockHistory
  }
  historyDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该配方吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await deleteRecipe(row.id)
        ElMessage.success('删除成功')
        loadData()
      } catch (e) {
        console.error('删除配方失败:', e)
      }
    })
    .catch(() => {})
}

const mockData = [
  { id: 1, recipeCode: 'R001', recipeName: '经典美式IPA', version: 3, beerStyle: 'IPA', targetAbv: 6.5, targetIbu: 65, targetOg: 1.065, targetFg: 1.015, batchSizeLiters: 50, createTime: '2024-01-10 10:00:00' },
  { id: 2, recipeCode: 'R002', recipeName: '牛奶世涛', version: 2, beerStyle: 'STOUT', targetAbv: 5.8, targetIbu: 35, targetOg: 1.055, targetFg: 1.012, batchSizeLiters: 50, createTime: '2024-01-08 14:30:00' },
  { id: 3, recipeCode: 'R003', recipeName: '比利时小麦', version: 1, beerStyle: 'WHEAT', targetAbv: 5.2, targetIbu: 20, targetOg: 1.048, targetFg: 1.010, batchSizeLiters: 50, createTime: '2024-01-05 09:00:00' },
  { id: 4, recipeCode: 'R004', recipeName: '德式皮尔森', version: 2, beerStyle: 'PILSNER', targetAbv: 4.8, targetIbu: 40, targetOg: 1.045, targetFg: 1.008, batchSizeLiters: 50, createTime: '2024-01-03 11:20:00' },
  { id: 5, recipeCode: 'R005', recipeName: '樱桃酸啤', version: 1, beerStyle: 'SOUR', targetAbv: 4.5, targetIbu: 15, targetOg: 1.042, targetFg: 1.008, batchSizeLiters: 30, createTime: '2024-01-01 16:00:00' }
]

const mockHistory = [
  { id: 11, recipeCode: 'R001', recipeName: '经典美式IPA', version: 1, targetAbv: 6.0, targetIbu: 60, createTime: '2023-12-01 10:00:00' },
  { id: 12, recipeCode: 'R001', recipeName: '经典美式IPA', version: 2, targetAbv: 6.2, targetIbu: 62, createTime: '2023-12-15 14:30:00' },
  { id: 1, recipeCode: 'R001', recipeName: '经典美式IPA', version: 3, targetAbv: 6.5, targetIbu: 65, createTime: '2024-01-10 10:00:00' }
]

loadData()
</script>

<style scoped>
.recipe-list {
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

.version-info {
  margin-bottom: 10px;
}
</style>
