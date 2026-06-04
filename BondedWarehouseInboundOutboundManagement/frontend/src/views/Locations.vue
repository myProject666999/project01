<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>库位管理</span>
          <el-button type="primary" @click="handleAdd">新增库位</el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="库区">
          <el-input v-model="searchForm.zone" placeholder="A/B/C" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="可用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="code" label="库位编码" width="150" />
        <el-table-column prop="zone" label="库区" width="100" />
        <el-table-column prop="aisle" label="通道" width="100" />
        <el-table-column prop="shelf" label="货架" width="100" />
        <el-table-column prop="layer" label="层级" width="100" />
        <el-table-column prop="position" label="货位" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '可用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="库位编码" prop="code">
          <el-input v-model="form.code" placeholder="如A-01-01" />
        </el-form-item>
        <el-form-item label="库区" prop="zone">
          <el-input v-model="form.zone" />
        </el-form-item>
        <el-form-item label="通道">
          <el-input v-model="form.aisle" />
        </el-form-item>
        <el-form-item label="货架">
          <el-input v-model="form.shelf" />
        </el-form-item>
        <el-form-item label="层级">
          <el-input v-model="form.layer" />
        </el-form-item>
        <el-form-item label="货位">
          <el-input v-model="form.position" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">可用</el-radio>
            <el-radio :value="0">禁用</el-radio>
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
import { locations } from '../api'

const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增库位')
const formRef = ref(null)
const isEdit = ref(false)

const searchForm = reactive({
  zone: '',
  status: undefined
})

const form = reactive({
  id: null,
  code: '',
  zone: '',
  aisle: '',
  shelf: '',
  layer: '',
  position: '',
  status: 1
})

const rules = {
  code: [{ required: true, message: '请输入库位编码', trigger: 'blur' }],
  zone: [{ required: true, message: '请输入库区', trigger: 'blur' }]
}

const loadData = async () => {
  try {
    const params = {}
    if (searchForm.zone) params.zone = searchForm.zone
    if (searchForm.status !== undefined && searchForm.status !== '') {
      params.status = searchForm.status
    }
    const data = await locations.list(params)
    tableData.value = data
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

const resetSearch = () => {
  searchForm.zone = ''
  searchForm.status = undefined
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增库位'
  Object.assign(form, {
    id: null,
    code: '',
    zone: '',
    aisle: '',
    shelf: '',
    layer: '',
    position: '',
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑库位'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该库位吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await locations.delete(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (isEdit.value) {
      await locations.update(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await locations.create(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
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
.search-form {
  margin-bottom: 20px;
}
</style>
