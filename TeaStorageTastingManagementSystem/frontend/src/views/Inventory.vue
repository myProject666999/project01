<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">库存管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增入库</el-button>
    </div>

    <div class="filter-bar">
      <el-select v-model="filters.tea_product_id" placeholder="选择茶品" clearable filterable style="width: 200px;">
        <el-option
          v-for="product in teaProducts"
          :key="product.id"
          :label="product.product_name"
          :value="product.id"
        />
      </el-select>
      <el-select v-model="filters.location_id" placeholder="选择仓位" clearable filterable style="width: 200px;">
        <el-option
          v-for="location in locations"
          :key="location.id"
          :label="location.location_code"
          :value="location.id"
        />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="teaProduct.product_name" label="茶品名称" width="150" />
        <el-table-column prop="teaProduct.production_year" label="年份" width="80" />
        <el-table-column prop="teaProduct.mountain" label="山头" width="100" />
        <el-table-column prop="teaProduct.fragrance_type" label="香型" width="100" />
        <el-table-column prop="location.location_code" label="存放仓位" width="120">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.location.location_code }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location.mountain" label="仓位山头" width="100" />
        <el-table-column prop="location.fragrance_type" label="仓位香型" width="100" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="storage_date" label="入仓日期" width="120" />
        <el-table-column prop="batch_no" label="批次号" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑库存' : '新增入库'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="茶品" prop="tea_product_id">
          <el-select
            v-model="form.tea_product_id"
            placeholder="请选择茶品"
            filterable
            style="width: 100%;"
            @change="handleTeaProductChange"
          >
            <el-option
              v-for="product in teaProducts"
              :key="product.id"
              :label="product.product_name + ' (' + product.production_year + ')'"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仓位" prop="location_id">
          <el-select
            v-model="form.location_id"
            placeholder="请选择仓位"
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="location in suitableLocations"
              :key="location.id"
              :label="`${location.location_code} (${location.current_quantity}/${location.max_capacity})`"
              :value="location.id"
            />
          </el-select>
          <div v-if="locationWarning" style="color: #f56c6c; font-size: 12px; margin-top: 5px;">
            {{ locationWarning }}
          </div>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input v-model.number="form.quantity" placeholder="请输入数量" />
        </el-form-item>
        <el-form-item label="入仓日期" prop="storage_date">
          <el-date-picker
            v-model="form.storage_date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="批次号">
          <el-input v-model="form.batch_no" placeholder="请输入批次号" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="2" placeholder="请输入备注" />
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getInventory, createInventory, updateInventory, deleteInventory } from '../api/inventory'
import { getTeaProducts } from '../api/teaProducts'
import { getAllStorageLocations, getSuitableLocations } from '../api/storageLocations'

const formRef = ref(null)
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const teaProducts = ref([])
const locations = ref([])
const suitableLocations = ref([])
const selectedProduct = ref(null)
const locationWarning = ref('')

const filters = reactive({
  tea_product_id: '',
  location_id: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const form = reactive({
  id: null,
  tea_product_id: null,
  location_id: null,
  quantity: 1,
  storage_date: '',
  batch_no: '',
  notes: ''
})

const rules = {
  tea_product_id: [{ required: true, message: '请选择茶品', trigger: 'change' }],
  location_id: [{ required: true, message: '请选择仓位', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  storage_date: [{ required: true, message: '请选择入仓日期', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    }
    const res = await getInventory(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const loadTeaProducts = async () => {
  try {
    const res = await getTeaProducts({ pageSize: 1000 })
    teaProducts.value = res.data.list
  } catch (error) {
    console.error('加载茶品失败:', error)
  }
}

const loadLocations = async () => {
  try {
    const res = await getAllStorageLocations()
    locations.value = res.data
    suitableLocations.value = res.data
  } catch (error) {
    console.error('加载仓位失败:', error)
  }
}

const handleTeaProductChange = async (productId) => {
  locationWarning.value = ''
  selectedProduct.value = teaProducts.value.find(p => p.id === productId)
  
  if (selectedProduct.value && (selectedProduct.value.mountain || selectedProduct.value.fragrance_type)) {
    try {
      const res = await getSuitableLocations({
        mountain: selectedProduct.value.mountain,
        fragrance_type: selectedProduct.value.fragrance_type
      })
      suitableLocations.value = res.data
      
      if (selectedProduct.value.mountain || selectedProduct.value.fragrance_type) {
        locationWarning.value = `防串味提示：已筛选适合${selectedProduct.value.mountain || ''}${selectedProduct.value.fragrance_type || ''}型茶品的仓位`
      }
    } catch (error) {
      console.error('加载合适仓位失败:', error)
    }
  } else {
    suitableLocations.value = locations.value
  }
}

const resetFilters = () => {
  filters.tea_product_id = ''
  filters.location_id = ''
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
  locationWarning.value = ''
  suitableLocations.value = locations.value
  Object.assign(form, {
    id: null,
    tea_product_id: null,
    location_id: null,
    quantity: 1,
    storage_date: new Date().toISOString().split('T')[0],
    batch_no: '',
    notes: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  locationWarning.value = ''
  selectedProduct.value = row.teaProduct
  suitableLocations.value = locations.value
  Object.assign(form, {
    id: row.id,
    tea_product_id: row.tea_product_id,
    location_id: row.location_id,
    quantity: row.quantity,
    storage_date: row.storage_date,
    batch_no: row.batch_no,
    notes: row.notes
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateInventory(form.id, form)
          ElMessage.success('更新成功')
        } else {
          await createInventory(form)
          ElMessage.success('入库成功')
        }
        dialogVisible.value = false
        loadData()
        loadLocations()
      } catch (error) {
        console.error('提交失败:', error)
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除该库存记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteInventory(row.id)
      ElMessage.success('删除成功')
      loadData()
      loadLocations()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
  loadTeaProducts()
  loadLocations()
})
</script>
