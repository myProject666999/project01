<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">批次管理</h1>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        新建批次
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="list" v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="batch_no" label="批次号" />
        <el-table-column label="仓库">
          <template #default="{ row }">
            {{ row.warehouse?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="total_packages" label="包裹数" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column prop="arrived_at" label="到仓时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewPackages(row)">
              查看包裹
            </el-button>
            <el-button type="success" link @click="addPackage(row)">
              添加包裹
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <el-dialog v-model="showCreateDialog" title="新建批次" width="500px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="选择仓库">
          <el-select v-model="createForm.warehouse_id" placeholder="请选择仓库">
            <el-option
              v-for="w in warehouses"
              :key="w.id"
              :label="w.name"
              :value="w.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createBatch">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showAddPackageDialog" title="添加包裹" width="700px">
      <el-form :model="packageForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="收件人姓名">
              <el-input v-model="packageForm.customer_name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话">
              <el-input v-model="packageForm.customer_phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="packageForm.customer_email" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="国家">
              <el-input v-model="packageForm.customer_country" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="城市">
              <el-input v-model="packageForm.customer_city" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="州/省">
              <el-input v-model="packageForm.customer_state" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮编">
              <el-input v-model="packageForm.customer_zip_code" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面单语言">
              <el-select v-model="packageForm.language">
                <el-option label="英语" value="en" />
                <el-option label="西班牙语" value="es" />
                <el-option label="阿拉伯语" value="ar" />
                <el-option label="法语" value="fr" />
                <el-option label="德语" value="de" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="详细地址">
              <el-input v-model="packageForm.customer_address" type="textarea" rows="2" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="重量(kg)">
              <el-input-number v-model="packageForm.weight" :precision="2" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="长度(cm)">
              <el-input-number v-model="packageForm.length" :precision="2" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="宽度(cm)">
              <el-input-number v-model="packageForm.width" :precision="2" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="高度(cm)">
              <el-input-number v-model="packageForm.height" :precision="2" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申报价值">
              <el-input-number v-model="packageForm.declared_value" :precision="2" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="货币">
              <el-input v-model="packageForm.currency" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="货物描述">
              <el-input v-model="packageForm.goods_description" type="textarea" rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showAddPackageDialog = false">取消</el-button>
        <el-button type="primary" @click="submitPackage">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { batchAPI, warehouseAPI } from '../api'

const router = useRouter()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const warehouses = ref([])
const showCreateDialog = ref(false)
const showAddPackageDialog = ref(false)
const currentBatch = ref(null)

const createForm = ref({
  warehouse_id: null,
  remark: ''
})

const packageForm = ref({
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  customer_country: '',
  customer_city: '',
  customer_state: '',
  customer_zip_code: '',
  customer_address: '',
  weight: 0,
  length: 0,
  width: 0,
  height: 0,
  goods_description: '',
  declared_value: 0,
  currency: 'USD',
  language: 'en'
})

const getStatusType = (status) => {
  const types = ['', 'success', 'warning', 'primary', 'success']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['', '已到仓', '分配中', '派送中', '已完成']
  return texts[status] || '未知'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await batchAPI.list({ page: page.value, page_size: pageSize.value })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadWarehouses = async () => {
  try {
    const res = await warehouseAPI.list()
    warehouses.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

const handleSelectionChange = (val) => {
  console.log(val)
}

const viewPackages = (row) => {
  router.push(`/batches/${row.id}/packages`)
}

const addPackage = (row) => {
  currentBatch.value = row
  showAddPackageDialog.value = true
}

const createBatch = async () => {
  if (!createForm.value.warehouse_id) {
    ElMessage.warning('请选择仓库')
    return
  }
  try {
    await batchAPI.create(createForm.value)
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    createForm.value = { warehouse_id: null, remark: '' }
    loadData()
  } catch (e) {
    console.error(e)
  }
}

const submitPackage = async () => {
  if (!packageForm.value.customer_name || !packageForm.value.customer_phone || !packageForm.value.customer_address) {
    ElMessage.warning('请填写完整的收件人信息')
    return
  }
  try {
    const data = {
      batch_id: currentBatch.value.id,
      warehouse_id: currentBatch.value.warehouse_id,
      ...packageForm.value
    }
    await batchAPI.addPackage(data)
    ElMessage.success('添加成功')
    showAddPackageDialog.value = false
    loadData()
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
  loadWarehouses()
})
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
