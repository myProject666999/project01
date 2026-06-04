<template>
  <div class="plot-list">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="省份">
          <el-select v-model="searchForm.province" placeholder="请选择省份" clearable>
            <el-option label="北京市" value="北京市" />
            <el-option label="上海市" value="上海市" />
            <el-option label="广东省" value="广东省" />
            <el-option label="浙江省" value="浙江省" />
            <el-option label="江苏省" value="江苏省" />
          </el-select>
        </el-form-item>
        <el-form-item label="品种">
          <el-select v-model="searchForm.variety" placeholder="请选择品种" clearable>
            <el-option label="人参" value="人参" />
            <el-option label="当归" value="当归" />
            <el-option label="黄芪" value="黄芪" />
            <el-option label="枸杞" value="枸杞" />
            <el-option label="金银花" value="金银花" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="种植中" value="1" />
            <el-option label="已采收" value="2" />
            <el-option label="闲置" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <div class="table-header">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增地块
        </el-button>
      </div>
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="地块编号" width="120" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="longitude" label="经度" width="100" />
        <el-table-column prop="latitude" label="纬度" width="100" />
        <el-table-column prop="altitude" label="海拔(m)" width="100" />
        <el-table-column prop="soilType" label="土壤类型" width="120" />
        <el-table-column prop="area" label="面积(亩)" width="100" />
        <el-table-column prop="seedlingSource" label="种苗来源" width="120" />
        <el-table-column prop="variety" label="种植品种" width="120" />
        <el-table-column prop="plantDate" label="种植日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </el-card>

    <PlotForm
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :data="currentRow"
      @success="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import PlotForm from './PlotForm.vue'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('add')
const currentRow = ref(null)

const searchForm = reactive({
  province: '',
  variety: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([
  {
    id: 'P2024001',
    name: '东北人参种植基地A区',
    address: '吉林省白山市抚松县XX镇XX村',
    longitude: '127.456789',
    latitude: '42.123456',
    altitude: 800,
    soilType: '黑土',
    area: 50,
    seedlingSource: '本地培育',
    variety: '人参',
    plantDate: '2024-04-15',
    status: 1
  },
  {
    id: 'P2024002',
    name: '云南三七种植基地',
    address: '云南省文山州文山市XX镇XX村',
    longitude: '104.245678',
    latitude: '23.345678',
    altitude: 1500,
    soilType: '红壤',
    area: 80,
    seedlingSource: '云南种苗基地',
    variety: '三七',
    plantDate: '2023-06-20',
    status: 2
  }
])

const getStatusText = (status) => {
  const statusMap = { 0: '闲置', 1: '种植中', 2: '已采收' }
  return statusMap[status] || '未知'
}

const getStatusTagType = (status) => {
  const typeMap = { 0: 'info', 1: 'success', 2: 'warning' }
  return typeMap[status] || 'info'
}

const fetchData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = 100
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.province = ''
  searchForm.variety = ''
  searchForm.status = ''
  handleSearch()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  currentRow.value = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogMode.value = 'edit'
  currentRow.value = { ...row }
  dialogVisible.value = true
}

const handleView = (row) => {
  dialogMode.value = 'view'
  currentRow.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除地块【${row.name}】吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchData()
  }).catch(() => {})
}

const handleSuccess = () => {
  dialogVisible.value = false
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.plot-list {
  padding: 20px;
}
.search-card {
  margin-bottom: 20px;
}
.search-form {
  display: flex;
  flex-wrap: wrap;
}
.table-header {
  margin-bottom: 16px;
}
.pagination {
  margin-top: 20px;
  justify-content: flex-end;
  display: flex;
}
</style>
