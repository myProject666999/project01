<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">茶品档案管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增茶品</el-button>
    </div>

    <div class="filter-bar">
      <el-input
        v-model="filters.keyword"
        placeholder="搜索茶品名称/产区/山头"
        :prefix-icon="Search"
        clearable
        @keyup.enter="loadData"
      />
      <el-input
        v-model="filters.production_year"
        placeholder="年份"
        clearable
        style="width: 120px;"
      />
      <el-select v-model="filters.material_type" placeholder="原料类型" clearable style="width: 120px;">
        <el-option label="纯料" value="pure" />
        <el-option label="拼配" value="blend" />
      </el-select>
      <el-select v-model="filters.shape" placeholder="形态" clearable style="width: 120px;">
        <el-option label="饼茶" value="cake" />
        <el-option label="砖茶" value="brick" />
        <el-option label="沱茶" value="tuo" />
        <el-option label="散茶" value="loose" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="product_name" label="茶品名称" width="150" />
        <el-table-column prop="origin" label="产区/厂家" width="150" />
        <el-table-column prop="production_year" label="年份" width="80" />
        <el-table-column prop="material_type" label="原料" width="80">
          <template #default="{ row }">
            {{ row.material_type === 'pure' ? '纯料' : '拼配' }}
          </template>
        </el-table-column>
        <el-table-column prop="shape" label="形态" width="80">
          <template #default="{ row }">
            {{ shapeMap[row.shape] }}
          </template>
        </el-table-column>
        <el-table-column prop="specification" label="规格(g)" width="100" />
        <el-table-column prop="mountain" label="山头" width="100" />
        <el-table-column prop="fragrance_type" label="香型" width="100" />
        <el-table-column prop="pressing_date" label="压制日期" width="120" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewCurve(row.id)">转化曲线</el-button>
            <el-button type="success" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑茶品' : '新增茶品'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="茶品名称" prop="product_name">
          <el-input v-model="form.product_name" placeholder="请输入茶品名称" />
        </el-form-item>
        <el-form-item label="产区/厂家" prop="origin">
          <el-input v-model="form.origin" placeholder="如：勐海茶厂7542" />
        </el-form-item>
        <el-form-item label="生产年份" prop="production_year">
          <el-input v-model.number="form.production_year" placeholder="请输入年份" />
        </el-form-item>
        <el-form-item label="原料类型" prop="material_type">
          <el-select v-model="form.material_type" style="width: 100%;">
            <el-option label="纯料" value="pure" />
            <el-option label="拼配" value="blend" />
          </el-select>
        </el-form-item>
        <el-form-item label="形态" prop="shape">
          <el-select v-model="form.shape" style="width: 100%;">
            <el-option label="饼茶" value="cake" />
            <el-option label="砖茶" value="brick" />
            <el-option label="沱茶" value="tuo" />
            <el-option label="散茶" value="loose" />
          </el-select>
        </el-form-item>
        <el-form-item label="规格(克)" prop="specification">
          <el-input v-model.number="form.specification" placeholder="默认357克" />
        </el-form-item>
        <el-form-item label="山头" prop="mountain">
          <el-input v-model="form.mountain" placeholder="如：布朗山、易武山" />
        </el-form-item>
        <el-form-item label="香型" prop="fragrance_type">
          <el-input v-model="form.fragrance_type" placeholder="如：蜜香、花香" />
        </el-form-item>
        <el-form-item label="压制日期" prop="pressing_date">
          <el-date-picker
            v-model="form.pressing_date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="备注描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入备注" />
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { getTeaProducts, createTeaProduct, updateTeaProduct, deleteTeaProduct } from '../api/teaProducts'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)

const shapeMap = {
  cake: '饼茶',
  brick: '砖茶',
  tuo: '沱茶',
  loose: '散茶'
}

const filters = reactive({
  keyword: '',
  production_year: '',
  material_type: '',
  shape: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const form = reactive({
  id: null,
  product_name: '',
  origin: '',
  production_year: new Date().getFullYear(),
  material_type: 'pure',
  shape: 'cake',
  specification: 357,
  mountain: '',
  fragrance_type: '',
  pressing_date: '',
  description: ''
})

const rules = {
  product_name: [{ required: true, message: '请输入茶品名称', trigger: 'blur' }],
  origin: [{ required: true, message: '请输入产区/厂家', trigger: 'blur' }],
  production_year: [{ required: true, message: '请输入生产年份', trigger: 'blur' }],
  material_type: [{ required: true, message: '请选择原料类型', trigger: 'change' }],
  shape: [{ required: true, message: '请选择形态', trigger: 'change' }],
  specification: [{ required: true, message: '请输入规格', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    }
    const res = await getTeaProducts(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  filters.keyword = ''
  filters.production_year = ''
  filters.material_type = ''
  filters.shape = ''
  pagination.page = 1
  loadData()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    product_name: '',
    origin: '',
    production_year: new Date().getFullYear(),
    material_type: 'pure',
    shape: 'cake',
    specification: 357,
    mountain: '',
    fragrance_type: '',
    pressing_date: '',
    description: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleViewCurve = (id) => {
  router.push(`/conversion-curve/${id}`)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateTeaProduct(form.id, form)
          ElMessage.success('更新成功')
        } else {
          await createTeaProduct(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('提交失败:', error)
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除茶品"${row.product_name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteTeaProduct(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>
