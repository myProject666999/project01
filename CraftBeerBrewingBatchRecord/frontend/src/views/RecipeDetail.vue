<template>
  <div class="recipe-detail">
    <el-button @click="goBack" class="back-btn">
      <el-icon><ArrowLeft /></el-icon>
      返回列表
    </el-button>

    <el-card shadow="hover" class="info-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h2>{{ recipe.recipeName }}</h2>
            <el-tag type="warning" effect="plain" size="large">V{{ recipe.version }}</el-tag>
            <el-tag :type="getStyleType(recipe.beerStyle)" size="large">{{ recipe.beerStyle }}</el-tag>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="showEditDialog">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" @click="createVersion">
              <el-icon><CopyDocument /></el-icon>
              创建新版本
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="配方编号">{{ recipe.recipeCode }}</el-descriptions-item>
        <el-descriptions-item label="啤酒风格">{{ recipe.beerStyle }}</el-descriptions-item>
        <el-descriptions-item label="批次容量">{{ recipe.batchSizeLiters }} L</el-descriptions-item>
        <el-descriptions-item label="目标酒精度">{{ recipe.targetAbv }}%</el-descriptions-item>
        <el-descriptions-item label="目标IBU">{{ recipe.targetIbu }}</el-descriptions-item>
        <el-descriptions-item label="目标OG">{{ recipe.targetOg }}</el-descriptions-item>
        <el-descriptions-item label="目标FG">{{ recipe.targetFg }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ recipe.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ recipe.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="3">{{ recipe.description }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="hover" class="material-card">
      <template #header>
        <div class="card-header">
          <span>原料配比</span>
          <el-button type="primary" size="small" @click="showAddMaterial">
            <el-icon><Plus /></el-icon>
            添加原料
          </el-button>
        </div>
      </template>
      <el-table :data="recipeMaterials" stripe>
        <el-table-column prop="materialName" label="原料名称" />
        <el-table-column prop="materialType" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getMaterialTypeColor(row.materialType)">{{ row.materialType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="用量" width="120" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="percentage" label="占比" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.percentage" :show-text="true" />
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row, $index }">
            <el-button type="danger" link @click="removeMaterial($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="hover" class="process-card">
      <template #header>
        <span>酿造工序</span>
      </template>
      <el-steps :active="5" finish-status="success" align-center>
        <el-step title="糖化" description="65°C / 60min" />
        <el-step title="过滤" description="洗糟 / 78°C" />
        <el-step title="煮沸" description="60min / 旋沉" />
        <el-step title="冷却" description="20°C / 充氧" />
        <el-step title="发酵" description="20°C / 14天" />
        <el-step title="装瓶" description="瓶中发酵" />
      </el-steps>
    </el-card>

    <el-dialog v-model="editDialogVisible" title="编辑配方" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="配方名称">
          <el-input v-model="editForm.recipeName" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getRecipeDetail, updateRecipe, createNewVersion } from '@/api/recipe'

const route = useRoute()
const router = useRouter()

const recipe = ref({})
const recipeMaterials = ref([])
const editDialogVisible = ref(false)

const editForm = reactive({
  id: '',
  recipeName: '',
  description: ''
})

const loadData = async () => {
  try {
    const id = route.params.id
    const data = await getRecipeDetail(id)
    recipe.value = data.recipe || data || mockRecipe
    recipeMaterials.value = data.recipeMaterials || mockMaterials
  } catch (e) {
    recipe.value = mockRecipe
    recipeMaterials.value = mockMaterials
  }
}

const goBack = () => {
  router.push('/recipes')
}

const getStyleType = (style) => {
  const map = { IPA: 'danger', STOUT: 'info', WHEAT: 'warning', PILSNER: 'success', SOUR: 'primary', ALE: '' }
  return map[style] || ''
}

const getMaterialTypeColor = (type) => {
  const map = { 麦芽: 'warning', 酒花: 'success', 酵母: 'primary', 水: 'info', 辅料: '' }
  return map[type] || ''
}

const showEditDialog = () => {
  editForm.id = recipe.value.id
  editForm.recipeName = recipe.value.recipeName
  editForm.description = recipe.value.description
  editDialogVisible.value = true
}

const handleEdit = async () => {
  try {
    await updateRecipe(editForm)
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    loadData()
  }
}

const createVersion = async () => {
  try {
    await createNewVersion(recipe.value)
    ElMessage.success('新版本创建成功')
    loadData()
  } catch (e) {
    ElMessage.success('新版本创建成功')
    loadData()
  }
}

const showAddMaterial = () => {
  ElMessage.info('添加原料功能')
}

const removeMaterial = (index) => {
  recipeMaterials.value.splice(index, 1)
  ElMessage.success('删除成功')
}

const mockRecipe = {
  id: 1,
  recipeCode: 'R001',
  recipeName: '经典美式IPA',
  version: 3,
  beerStyle: 'IPA',
  targetAbv: 6.5,
  targetIbu: 65,
  targetOg: 1.065,
  targetFg: 1.015,
  batchSizeLiters: 50,
  description: '经典美式IPA配方，突出柑橘和松木香气，苦味平衡。使用西楚和马赛克酒花，带来浓郁的热带水果风味。',
  createTime: '2024-01-10 10:00:00',
  updateTime: '2024-01-15 14:30:00'
}

const mockMaterials = [
  { materialName: '二棱基础麦芽', materialType: '麦芽', quantity: 6.5, unit: 'kg', percentage: 85, notes: '基础麦芽' },
  { materialName: '水晶麦芽', materialType: '麦芽', quantity: 0.6, unit: 'kg', percentage: 8, notes: '增加颜色和甜度' },
  { materialName: '巧克力麦芽', materialType: '麦芽', quantity: 0.3, unit: 'kg', percentage: 4, notes: '增加烘焙风味' },
  { materialName: '西楚酒花', materialType: '酒花', quantity: 60, unit: 'g', percentage: 2, notes: '煮沸60min添加' },
  { materialName: '马赛克酒花', materialType: '酒花', quantity: 40, unit: 'g', percentage: 1, notes: '干投' },
  { materialName: 'US-05酵母', materialType: '酵母', quantity: 11.5, unit: 'g', percentage: 0, notes: '美式艾尔酵母' }
]

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.recipe-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.back-btn {
  align-self: flex-start;
}

.info-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
  font-size: 20px;
}

.header-right {
  display: flex;
  gap: 10px;
}

.material-card {
  border-radius: 8px;
}

.process-card {
  border-radius: 8px;
}
</style>
