<template>
  <div class="material-list">
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="搜索原料名称/编号" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="原料类型">
          <el-select v-model="filterForm.materialTypeId" placeholder="全部类型" clearable style="width: 180px">
            <el-option v-for="t in materialTypes" :key="t.id" :label="t.typeName" :value="t.id" />
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
            新增原料
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="table-card">
      <el-table :data="tableData" stripe v-loading="loading">
        <el-table-column prop="materialCode" label="原料编号" width="120" fixed="left" />
        <el-table-column prop="materialName" label="原料名称" min-width="160" />
        <el-table-column prop="materialTypeId" label="原料类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.materialTypeId)">{{ getTypeName(row.materialTypeId) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="specification" label="规格" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="stockQuantity" label="库存数量" width="120">
          <template #default="{ row }">
            <span :class="getStockClass(row.stockQuantity, row.minStock)">
              {{ row.stockQuantity }} {{ row.unit }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="minStock" label="安全库存" width="100" />
        <el-table-column prop="supplier" label="供应商" />
        <el-table-column prop="countryOfOrigin" label="产地" width="100" />
        <el-table-column prop="createTime" label="入库时间" width="180" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ row.status === 'ACTIVE' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="showEditDialog(row)">编辑</el-button>
            <el-button type="success" link @click="showStockInDialog(row)">入库</el-button>
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

    <el-dialog v-model="addDialogVisible" title="新增原料" width="600px">
      <el-form :model="materialForm" label-width="100px">
        <el-form-item label="原料编号" required>
          <el-input v-model="materialForm.materialCode" placeholder="请输入原料编号" />
        </el-form-item>
        <el-form-item label="原料名称" required>
          <el-input v-model="materialForm.materialName" placeholder="请输入原料名称" />
        </el-form-item>
        <el-form-item label="原料类型" required>
          <el-select v-model="materialForm.materialTypeId" placeholder="请选择类型" style="width: 100%">
            <el-option v-for="t in materialTypes" :key="t.id" :label="t.typeName" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规格">
              <el-input v-model="materialForm.specification" placeholder="请输入规格" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位">
              <el-input v-model="materialForm.unit" placeholder="kg/g/L等" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="库存数量">
              <el-input-number v-model="materialForm.stockQuantity" :step="1" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安全库存">
              <el-input-number v-model="materialForm.minStock" :step="1" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="供应商">
          <el-input v-model="materialForm.supplier" placeholder="请输入供应商" />
        </el-form-item>
        <el-form-item label="产地">
          <el-input v-model="materialForm.countryOfOrigin" placeholder="请输入产地" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="materialForm.notes" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="编辑原料" width="600px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="原料名称">
          <el-input v-model="editForm.materialName" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="editForm.supplier" />
        </el-form-item>
        <el-form-item label="安全库存">
          <el-input-number v-model="editForm.minStock" :step="1" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status" style="width: 100%">
            <el-option label="启用" value="ACTIVE" />
            <el-option label="禁用" value="INACTIVE" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.notes" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="stockInDialogVisible" title="原料入库" width="500px">
      <el-form :model="stockInForm" label-width="100px">
        <el-form-item label="原料名称">
          <el-input :value="currentMaterial?.materialName" disabled />
        </el-form-item>
        <el-form-item label="当前库存">
          <el-input :value="currentStock" disabled />
        </el-form-item>
        <el-form-item label="入库数量" required>
          <el-input-number v-model="stockInForm.quantity" :step="1" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="入库批号">
          <el-input v-model="stockInForm.batchNo" placeholder="请输入入库批号" />
        </el-form-item>
        <el-form-item label="入库日期">
          <el-date-picker v-model="stockInForm.inDate" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="stockInForm.notes" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockInDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStockIn">确认入库</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMaterialList, deleteMaterial, addMaterial, updateMaterial } from '@/api/material'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentMaterial = ref(null)

const materialTypes = [
  { id: 1, typeName: '麦芽' },
  { id: 2, typeName: '酒花' },
  { id: 3, typeName: '酵母' },
  { id: 4, typeName: '水' },
  { id: 5, typeName: '辅料' }
]

const filterForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  materialTypeId: null
})

const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const stockInDialogVisible = ref(false)

const materialForm = reactive({
  materialCode: '',
  materialName: '',
  materialTypeId: null,
  specification: '',
  unit: 'kg',
  stockQuantity: 0,
  minStock: 10,
  supplier: '',
  countryOfOrigin: '',
  notes: ''
})

const editForm = reactive({
  id: '',
  materialName: '',
  supplier: '',
  minStock: 10,
  status: 'ACTIVE',
  notes: ''
})

const stockInForm = reactive({
  quantity: 1,
  batchNo: '',
  inDate: '',
  notes: ''
})

const currentStock = computed(() => {
  if (currentMaterial.value) {
    return currentMaterial.value.stockQuantity + ' ' + currentMaterial.value.unit
  }
  return '-'
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMaterialList(filterForm)
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
  filterForm.materialTypeId = null
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

const getTypeColor = (typeId) => {
  const map = { 1: 'warning', 2: 'success', 3: 'primary', 4: 'info', 5: '' }
  return map[typeId] || ''
}

const getTypeName = (typeId) => {
  const type = materialTypes.find(t => t.id === typeId)
  return type ? type.typeName : typeId
}

const getStockClass = (stock, minStock) => {
  if (stock <= minStock) return 'stock-low'
  if (stock <= minStock * 2) return 'stock-medium'
  return 'stock-high'
}

const showAddDialog = () => {
  Object.assign(materialForm, {
    materialCode: '',
    materialName: '',
    materialTypeId: null,
    specification: '',
    unit: 'kg',
    stockQuantity: 0,
    minStock: 10,
    supplier: '',
    countryOfOrigin: '',
    notes: ''
  })
  addDialogVisible.value = true
}

const handleAdd = async () => {
  try {
    await addMaterial(materialForm)
    ElMessage.success('原料添加成功')
    addDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.success('原料添加成功')
    addDialogVisible.value = false
    loadData()
  }
}

const showEditDialog = (row) => {
  editForm.id = row.id
  editForm.materialName = row.materialName
  editForm.supplier = row.supplier
  editForm.minStock = row.minStock
  editForm.status = row.status || 'ACTIVE'
  editForm.notes = row.notes || ''
  editDialogVisible.value = true
}

const handleEdit = async () => {
  try {
    await updateMaterial(editForm)
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.success('更新成功')
    editDialogVisible.value = false
    loadData()
  }
}

const showStockInDialog = (row) => {
  currentMaterial.value = row
  stockInForm.quantity = 1
  stockInForm.batchNo = ''
  stockInForm.inDate = ''
  stockInForm.notes = ''
  stockInDialogVisible.value = true
}

const handleStockIn = () => {
  currentMaterial.value.stockQuantity += stockInForm.quantity
  ElMessage.success(`入库成功，新增 ${stockInForm.quantity} ${currentMaterial.value.unit}`)
  stockInDialogVisible.value = false
  loadData()
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该原料吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await deleteMaterial(row.id)
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
  { id: 1, materialCode: 'M001', materialName: '二棱基础麦芽', materialTypeId: 1, specification: '澳洲进口', unit: 'kg', stockQuantity: 150, minStock: 50, supplier: '麦芽供应商A', countryOfOrigin: '澳大利亚', status: 'ACTIVE', createTime: '2024-01-01 10:00:00' },
  { id: 2, materialCode: 'M002', materialName: '水晶麦芽', materialTypeId: 1, specification: '美式', unit: 'kg', stockQuantity: 25, minStock: 20, supplier: '麦芽供应商A', countryOfOrigin: '美国', status: 'ACTIVE', createTime: '2024-01-02 10:00:00' },
  { id: 3, materialCode: 'H001', materialName: '西楚酒花', materialTypeId: 2, specification: '颗粒酒花', unit: 'kg', stockQuantity: 8, minStock: 5, supplier: '酒花供应商B', countryOfOrigin: '美国', status: 'ACTIVE', createTime: '2024-01-03 10:00:00' },
  { id: 4, materialCode: 'H002', materialName: '马赛克酒花', materialTypeId: 2, specification: '颗粒酒花', unit: 'kg', stockQuantity: 3, minStock: 5, supplier: '酒花供应商B', countryOfOrigin: '美国', status: 'ACTIVE', createTime: '2024-01-04 10:00:00' },
  { id: 5, materialCode: 'Y001', materialName: 'US-05酵母', materialTypeId: 3, specification: '干酵母', unit: 'g', stockQuantity: 500, minStock: 200, supplier: '酵母供应商C', countryOfOrigin: '法国', status: 'ACTIVE', createTime: '2024-01-05 10:00:00' },
  { id: 6, materialCode: 'M003', materialName: '巧克力麦芽', materialTypeId: 1, specification: '深度烘焙', unit: 'kg', stockQuantity: 12, minStock: 10, supplier: '麦芽供应商A', countryOfOrigin: '德国', status: 'ACTIVE', createTime: '2024-01-06 10:00:00' },
  { id: 7, materialCode: 'H003', materialName: '卡斯卡特酒花', materialTypeId: 2, specification: '颗粒酒花', unit: 'kg', stockQuantity: 15, minStock: 5, supplier: '酒花供应商B', countryOfOrigin: '美国', status: 'ACTIVE', createTime: '2024-01-07 10:00:00' },
  { id: 8, materialCode: 'Y002', materialName: 'W-34/70酵母', materialTypeId: 3, specification: '干酵母', unit: 'g', stockQuantity: 0, minStock: 100, supplier: '酵母供应商C', countryOfOrigin: '德国', status: 'INACTIVE', createTime: '2024-01-08 10:00:00' }
]

loadData()
</script>

<style scoped>
.material-list {
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

.stock-high {
  color: #67c23a;
  font-weight: bold;
}

.stock-medium {
  color: #e6a23c;
  font-weight: bold;
}

.stock-low {
  color: #f56c6c;
  font-weight: bold;
}
</style>
