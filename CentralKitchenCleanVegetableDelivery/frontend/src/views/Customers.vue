<template>
  <div class="customers">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>客户列表</span>
          <el-button type="primary" @click="openDialog">
            <el-icon><Plus /></el-icon>
            新增客户
          </el-button>
        </div>
      </template>
      
      <el-table :data="customers" style="width: 100%">
        <el-table-column prop="name" label="客户名称" />
        <el-table-column prop="type" label="客户类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="contact_person" label="联系人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑客户' : '新增客户'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="客户名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="客户类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择客户类型" style="width: 100%">
            <el-option label="学校食堂" value="学校食堂" />
            <el-option label="连锁餐厅" value="连锁餐厅" />
            <el-option label="企业食堂" value="企业食堂" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact_person">
          <el-input v-model="form.contact_person" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
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
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/api'

const customers = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentId = ref(null)

const form = reactive({
  name: '',
  type: '',
  address: '',
  contact_person: '',
  phone: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择客户类型', trigger: 'change' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }]
}

const loadData = async () => {
  try {
    const res = await getCustomers()
    customers.value = res.data || []
  } catch (error) {
    console.error('加载客户列表失败', error)
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
      type: '',
      address: '',
      contact_person: '',
      phone: '',
      status: 1
    })
  }
  
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  
  try {
    if (isEdit.value) {
      await updateCustomer(currentId.value, form)
      ElMessage.success('编辑成功')
    } else {
      await createCustomer(form)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('提交失败', error)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该客户吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCustomer(row.id)
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
