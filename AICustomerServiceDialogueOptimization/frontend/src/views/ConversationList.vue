<template>
  <div class="page-container">
    <div class="page-header">
      <h2>会话质检</h2>
    </div>

    <div class="search-form">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索会话ID/客服姓名"
        clearable
        style="width: 240px"
      />
      <el-select v-model="searchForm.qualityStatus" placeholder="质检状态" clearable style="width: 140px">
        <el-option label="待质检" :value="0" />
        <el-option label="质检中" :value="1" />
        <el-option label="已质检" :value="2" />
        <el-option label="需复检" :value="3" />
      </el-select>
      <el-select v-model="searchForm.hasViolation" placeholder="违规状态" clearable style="width: 140px">
        <el-option label="无违规" :value="0" />
        <el-option label="有违规" :value="1" />
      </el-select>
      <el-button type="primary" @click="loadData">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" style="width: 100%;">
      <el-table-column prop="sessionId" label="会话ID" width="180" />
      <el-table-column prop="csName" label="客服姓名" width="100" />
      <el-table-column prop="channel" label="渠道" width="100">
        <template #default="scope">
          <el-tag size="small">{{ scope.row.channel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="180" />
      <el-table-column prop="duration" label="时长(秒)" width="100" />
      <el-table-column prop="messageCount" label="消息数" width="100" />
      <el-table-column prop="totalScore" label="质检得分" width="100">
        <template #default="scope">
          <span :class="{ 'score-high': scope.row.totalScore >= 90, 'score-low': scope.row.totalScore < 60 }">
            {{ scope.row.totalScore || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="qualityStatus" label="质检状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.qualityStatus === 0" type="info">待质检</el-tag>
          <el-tag v-else-if="scope.row.qualityStatus === 1" type="warning">质检中</el-tag>
          <el-tag v-else-if="scope.row.qualityStatus === 2" type="success">已质检</el-tag>
          <el-tag v-else type="danger">需复检</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="hasViolation" label="违规" width="80">
        <template #default="scope">
          <el-tag v-if="scope.row.hasViolation === 1" type="danger">是</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <div class="table-actions">
            <el-button type="primary" size="small" link @click="viewDetail(scope.row)">
              详情
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page.pageNum"
      v-model:page-size="page.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadData"
      @current-change="loadData"
      style="margin-top: 20px; justify-content: flex-end; display: flex;"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { conversationApi } from '@/api'

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const searchForm = reactive({
  keyword: '',
  qualityStatus: null,
  hasViolation: null
})

const page = reactive({
  pageNum: 1,
  pageSize: 10
})

const mockData = [
  {
    id: 1,
    sessionId: 'SESSION202406010001',
    csName: '张三',
    channel: 'APP',
    startTime: '2024-06-01 09:15:30',
    duration: 320,
    messageCount: 28,
    totalScore: 92.5,
    qualityStatus: 2,
    hasViolation: 0
  },
  {
    id: 2,
    sessionId: 'SESSION202406010002',
    csName: '李四',
    channel: 'WEB',
    startTime: '2024-06-01 10:22:15',
    duration: 180,
    messageCount: 15,
    totalScore: 78.0,
    qualityStatus: 2,
    hasViolation: 1
  },
  {
    id: 3,
    sessionId: 'SESSION202406010003',
    csName: '王五',
    channel: 'WECHAT',
    startTime: '2024-06-01 11:05:45',
    duration: 450,
    messageCount: 42,
    totalScore: 55.5,
    qualityStatus: 3,
    hasViolation: 1
  },
  {
    id: 4,
    sessionId: 'SESSION202406010004',
    csName: '赵六',
    channel: 'PHONE',
    startTime: '2024-06-01 14:30:00',
    duration: 600,
    messageCount: 56,
    totalScore: null,
    qualityStatus: 0,
    hasViolation: 0
  },
  {
    id: 5,
    sessionId: 'SESSION202406010005',
    csName: '钱七',
    channel: 'APP',
    startTime: '2024-06-01 15:45:20',
    duration: 240,
    messageCount: 22,
    totalScore: 85.0,
    qualityStatus: 2,
    hasViolation: 0
  }
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await conversationApi.list({
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      keyword: searchForm.keyword,
      qualityStatus: searchForm.qualityStatus,
      hasViolation: searchForm.hasViolation
    })
    if (res.data && res.data.list) {
      tableData.value = res.data.list
      total.value = res.data.total
    } else {
      tableData.value = mockData
      total.value = mockData.length
    }
  } catch (e) {
    tableData.value = mockData
    total.value = mockData.length
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.qualityStatus = null
  searchForm.hasViolation = null
  page.pageNum = 1
  loadData()
}

const viewDetail = (row) => {
  router.push(`/conversation/${row.id}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.score-high {
  color: #67c23a;
  font-weight: bold;
}

.score-low {
  color: #f56c6c;
  font-weight: bold;
}
</style>
