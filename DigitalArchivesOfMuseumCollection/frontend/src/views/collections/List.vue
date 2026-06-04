<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">藏品管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增藏品
      </el-button>
    </div>

    <el-card>
      <div class="search-bar">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索藏品名称/编号"
          clearable
          style="width: 240px"
          @keyup.enter="loadData"
        />
        <el-select v-model="searchForm.status" placeholder="藏品状态" clearable style="width: 140px">
          <el-option label="在库" value="在库" />
          <el-option label="展出" value="展出" />
          <el-option label="外借" value="外借" />
          <el-option label="修复中" value="修复中" />
          <el-option label="待查" value="待查" />
        </el-select>
        <el-select v-model="searchForm.level" placeholder="文物级别" clearable style="width: 140px">
          <el-option label="一级" value="一级" />
          <el-option label="二级" value="二级" />
          <el-option label="三级" value="三级" />
          <el-option label="一般" value="一般" />
        </el-select>
        <el-button type="primary" @click="loadData">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="resetSearch">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="collection_no" label="藏品编号" width="160" />
        <el-table-column prop="name" label="名称" min-width="180" />
        <el-table-column prop="era" label="年代" width="120" />
        <el-table-column prop="material" label="材质" width="120" />
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="current_location" label="当前位置" min-width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="success" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :page-sizes="[20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category_id">
              <el-cascader
                v-model="categoryValue"
                :options="categories"
                :props="{ value: 'id', label: 'name', children: 'children' }"
                style="width: 100%"
                @change="handleCategoryChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年代" prop="era">
              <el-input v-model="form.era" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源" prop="source">
              <el-select v-model="form.source" style="width: 100%">
                <el-option label="征集" value="征集" />
                <el-option label="出土" value="出土" />
                <el-option label="捐赠" value="捐赠" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="材质" prop="material">
              <el-input v-model="form.material" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文物级别" prop="level">
              <el-select v-model="form.level" style="width: 100%">
                <el-option label="一级" value="一级" />
                <el-option label="二级" value="二级" />
                <el-option label="三级" value="三级" />
                <el-option label="一般" value="一般" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价值评估" prop="value_assessment">
              <el-input-number v-model="form.value_assessment" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前位置" prop="current_location">
              <el-select v-model="form.current_location" filterable style="width: 100%">
                <el-option v-for="loc in locations" :key="loc.id" :label="loc.name" :value="loc.name" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="尺寸" prop="dimensions">
              <el-input v-model="form.dimensions" placeholder="如: 高30cm, 宽20cm" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重量(kg)" prop="weight">
              <el-input-number v-model="form.weight" :min="0" :precision="3" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getCategories,
  getLocations
} from '@/api'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增藏品')
const formRef = ref(null)
const categoryValue = ref([])
const categories = ref([])
const locations = ref([])

const searchForm = reactive({
  keyword: '',
  status: '',
  level: ''
})

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
})

const tableData = ref([])

const form = reactive({
  id: null,
  category_id: null,
  category_no: '',
  name: '',
  era: '',
  source: '',
  material: '',
  level: '一般',
  value_assessment: null,
  current_location: '',
  description: '',
  dimensions: '',
  weight: null
})

const formRules = {
  name: [{ required: true, message: '请输入藏品名称', trigger: 'blur' }]
}

const getLevelTagType = (level) => {
  const types = {
    '一级': 'danger',
    '二级': 'warning',
    '三级': 'success',
    '一般': 'info'
  }
  return types[level] || 'info'
}

const getStatusTagType = (status) => {
  const types = {
    '在库': 'success',
    '展出': 'warning',
    '外借': 'info',
    '修复中': 'danger',
    '待查': 'danger'
  }
  return types[status] || 'info'
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCollections({
      page: pagination.page,
      page_size: pagination.page_size,
      ...searchForm
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  searchForm.level = ''
  pagination.page = 1
  loadData()
}

const loadCategories = async () => {
  try {
    categories.value = await getCategories()
  } catch (err) {
    console.error(err)
  }
}

const loadLocations = async () => {
  try {
    locations.value = await getLocations()
  } catch (err) {
    console.error(err)
  }
}

const handleCategoryChange = (value) => {
  if (value && value.length > 0) {
    form.category_id = value[value.length - 1]
  } else {
    form.category_id = null
  }
}

const handleAdd = () => {
  dialogTitle.value = '新增藏品'
  Object.assign(form, {
    id: null,
    category_id: null,
    category_no: '',
    name: '',
    era: '',
    source: '',
    material: '',
    level: '一般',
    value_assessment: null,
    current_location: '',
    description: '',
    dimensions: '',
    weight: null
  })
  categoryValue.value = []
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑藏品'
  Object.assign(form, row)
  categoryValue.value = row.category_id ? [row.category_id] : []
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/collections/${row.id}`)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (form.id) {
          await updateCollection(form.id, form)
          ElMessage.success('更新成功')
        } else {
          await createCollection(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (err) {
        console.error(err)
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该藏品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCollection(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
  loadCategories()
  loadLocations()
})
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
