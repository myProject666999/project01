<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">包裹列表 - {{ batchNo }}</h1>
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="package_no" label="包裹号" />
        <el-table-column label="收件人">
          <template #default="{ row }">
            {{ row.customer?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="联系电话">
          <template #default="{ row }">
            {{ row.customer?.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="地址">
          <template #default="{ row }">
            {{ row.customer?.address || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="language" label="面单语言">
          <template #default="{ row }">
            <el-tag>{{ getLanguageText(row.language) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewLabel(row)">
              查看面单
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { packageAPI } from '../api'

const route = useRoute()
const router = useRouter()
const batchId = route.params.id
const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const batchNo = ref('')

const getLanguageText = (lang) => {
  const texts = { 'en': '英语', 'es': '西班牙语', 'ar': '阿拉伯语', 'fr': '法语', 'de': '德语' }
  return texts[lang] || lang
}

const getStatusType = (status) => {
  const types = ['', 'success', 'warning', 'primary', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['', '待分配', '已分配', '派送中', '已签收', '异常']
  return texts[status] || '未知'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await packageAPI.list(batchId, { page: page.value, page_size: pageSize.value })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
    if (list.value.length > 0) {
      batchNo.value = list.value[0].batch?.batch_no || ''
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const viewLabel = (row) => {
  router.push(`/packages/${row.id}/label`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
