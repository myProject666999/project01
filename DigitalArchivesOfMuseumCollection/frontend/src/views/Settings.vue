<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>位置管理</span>
              <el-button type="primary" size="small" @click="locationDialogVisible = true">新增</el-button>
            </div>
          </template>
          <el-table :data="locations" stripe border size="small">
            <el-table-column prop="name" label="位置名称" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag size="small">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="building" label="楼号" width="100" />
            <el-table-column prop="floor" label="楼层" width="80" />
            <el-table-column prop="room_no" label="房间号" width="100" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>分类管理</span>
              <el-button type="primary" size="small" @click="categoryDialogVisible = true">新增</el-button>
            </div>
          </template>
          <el-tree :data="categories" :props="{ label: 'name' }" />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="locationDialogVisible"
      title="新增位置"
      width="500px"
    >
      <el-form :model="locationForm" label-width="80px">
        <el-form-item label="位置名称">
          <el-input v-model="locationForm.name" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="locationForm.type" style="width: 100%">
            <el-option label="库房" value="库房" />
            <el-option label="展厅" value="展厅" />
            <el-option label="修复室" value="修复室" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="楼号">
          <el-input v-model="locationForm.building" />
        </el-form-item>
        <el-form-item label="楼层">
          <el-input v-model="locationForm.floor" />
        </el-form-item>
        <el-form-item label="房间号">
          <el-input v-model="locationForm.room_no" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="locationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddLocation">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="categoryDialogVisible"
      title="新增分类"
      width="500px"
    >
      <el-form :model="categoryForm" label-width="80px">
        <el-form-item label="分类编码">
          <el-input v-model="categoryForm.code" />
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-tree-select
            v-model="categoryForm.parent_id"
            :data="categories"
            :props="{ value: 'id', label: 'name' }"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddCategory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCategories, createCategory, getLocations, createLocation } from '@/api'

const locations = ref([])
const categories = ref([])
const locationDialogVisible = ref(false)
const categoryDialogVisible = ref(false)

const locationForm = reactive({
  name: '',
  type: '库房',
  building: '',
  floor: '',
  room_no: ''
})

const categoryForm = reactive({
  code: '',
  name: '',
  parent_id: 0
})

const loadData = async () => {
  try {
    locations.value = await getLocations()
    categories.value = await getCategories()
  } catch (err) {
    console.error(err)
  }
}

const handleAddLocation = async () => {
  if (!locationForm.name) {
    ElMessage.warning('请输入位置名称')
    return
  }
  try {
    await createLocation(locationForm)
    ElMessage.success('创建成功')
    locationDialogVisible.value = false
    loadData()
  } catch (err) {
    console.error(err)
  }
}

const handleAddCategory = async () => {
  if (!categoryForm.name) {
    ElMessage.warning('请输入分类名称')
    return
  }
  try {
    await createCategory(categoryForm)
    ElMessage.success('创建成功')
    categoryDialogVisible.value = false
    loadData()
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
