<template>
  <div class="products">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜品列表</span>
          <el-button type="primary" @click="openDialog">
            <el-icon><Plus /></el-icon>
            新增菜品
          </el-button>
        </div>
      </template>
      
      <el-table :data="products" style="width: 100%">
        <el-table-column prop="name" label="菜品名称" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="price" label="单价(元)" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="processing_time" label="加工时间(分钟)" width="120" />
        <el-table-column prop="equipment_type" label="所需设备" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑菜品' : '新增菜品'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="蔬菜" value="蔬菜" />
            <el-option label="肉类" value="肉类" />
            <el-option label="海鲜" value="海鲜" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-select v-model="form.unit" placeholder="请选择单位" style="width: 100%">
            <el-option label="kg" value="kg" />
            <el-option label="袋" value="袋" />
            <el-option label="箱" value="箱" />
          </el-select>
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="加工时间" prop="processing_time">
          <el-input-number v-model="form.processing_time" :min="0" placeholder="分钟" style="width: 100%" />
        </el-form-item>
        <el-form-item label="所需设备" prop="equipment_type">
          <el-select v-model="form.equipment_type" placeholder="请选择设备类型" style="width: 100%">
            <el-option label="切菜机" value="切菜机" />
            <el-option label="切丝机" value="切丝机" />
            <el-option label="切片机" value="切片机" />
            <el-option label="切丁机" value="切丁机" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/api'

const products = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentId = ref(null)

const form = reactive({
  name: '',
  category: '',
  unit: 'kg',
  price: 0,
  processing_time: 0,
  equipment_type: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入菜品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }]
}

const loadData = async () => {
  try {
    const res = await getProducts()
    products.value = res.data || []
  } catch (error) {
    console.error('加载菜品列表失败', error)
  }
}

const openDialog = (row = null) => {
  isEdit.value = !!row
  currentId.value = row?.id
  
  if (row) {
    Object.assign(form, row)
  } else {
    Object.assign(form, {
      name: '',
      category: '',
      unit: 'kg',
      price: 0,
      processing_time: 0,
      equipment_type: '',
      status: 1
    })
  }
  
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  
  try {
    if (isEdit.value) {
      await updateProduct(currentId.value, form)
      ElMessage.success('编辑成功')
    } else {
      await createProduct(form)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('提交失败', error)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该菜品吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteProduct(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败', error)
    }
  })
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
