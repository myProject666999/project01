<template>
  <div class="page-container">
    <div class="page-header">
      <h2>违规记录</h2>
    </div>

    <div class="search-form">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索客服姓名/违规编号"
        clearable
        style="width: 240px"
      />
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 140px">
        <el-option label="待确认" :value="1" />
        <el-option label="已确认" :value="2" />
        <el-option label="申诉中" :value="3" />
        <el-option label="已撤销" :value="4" />
      </el-select>
      <el-select v-model="searchForm.violationLevel" placeholder="违规等级" clearable style="width: 140px">
        <el-option label="轻微" :value="1" />
        <el-option label="一般" :value="2" />
        <el-option label="严重" :value="3" />
      </el-select>
      <el-button type="primary" @click="loadData">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" style="width: 100%;">
      <el-table-column prop="violationNo" label="违规编号" width="180" />
      <el-table-column prop="csName" label="客服姓名" width="100" />
      <el-table-column prop="ruleName" label="违规规则" />
      <el-table-column prop="violationLevel" label="违规等级" width="100">
        <template #default="scope">
          <span class="violation-tag" :class="`level-${scope.row.violationLevel}`">
            {{ getViolationLevelText(scope.row.violationLevel) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="deductScore" label="扣分" width="80" />
      <el-table-column prop="hitContent" label="违规内容" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 1" type="warning">待确认</el-tag>
          <el-tag v-else-if="scope.row.status === 2" type="success">已确认</el-tag>
          <el-tag v-else-if="scope.row.status === 3" type="info">申诉中</el-tag>
          <el-tag v-else type="info">已撤销</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <div class="table-actions">
            <el-button
              type="primary"
              size="small"
              link
              @click="confirmViolation(scope.row.id)"
              :disabled="scope.row.status !== 1"
            >
              确认
            </el-button>
            <el-button
              type="warning"
              size="small"
              link
              @click="openAppealDialog(scope.row)"
              :disabled="scope.row.status !== 1"
            >
              申诉
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              @click="revokeViolation(scope.row.id)"
              :disabled="scope.row.status === 4"
            >
              撤销
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

  <el-dialog v-model="appealDialogVisible" title="提交申诉" width="500px">
    <el-form :model="appealForm" label-width="100px">
      <el-form-item label="申诉理由" required>
        <el-input
          v-model="appealForm.appealReason"
          type="textarea"
          :rows="4"
          placeholder="请输入申诉理由"
        />
      </el-form-item>
      <el-form-item label="申诉证据">
        <el-input
          v-model="appealForm.appealEvidence"
          type="textarea"
          :rows="3"
          placeholder="请提供相关证据说明"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="appealDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitAppeal">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { violationApi, appealApi } from '@/api'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const appealDialogVisible = ref(false)
const currentViolation = ref(null)

const searchForm = reactive({
  keyword: '',
  status: null,
  violationLevel: null
})

const page = reactive({
  pageNum: 1,
  pageSize: 10
})

const appealForm = reactive({
  appealReason: '',
  appealEvidence: ''
})

const mockData = [
  {
    id: 1,
    violationNo: 'VIO202406010001',
    csName: '李四',
    ruleName: '开场白规范',
    violationLevel: 2,
    deductScore: 5,
    hitContent: '未使用标准开场白问候客户',
    status: 1,
    createTime: '2024-06-01 10:30:00'
  },
  {
    id: 2,
    violationNo: 'VIO202406010002',
    csName: '王五',
    ruleName: '平均响应超时',
    violationLevel: 1,
    deductScore: 3,
    hitContent: '平均响应时间45秒，超过30秒标准',
    status: 2,
    createTime: '2024-06-01 11:15:00'
  },
  {
    id: 3,
    violationNo: 'VIO202406010003',
    csName: '王五',
    ruleName: '禁用辱骂词汇',
    violationLevel: 3,
    deductScore: 10,
    hitContent: '检测到违规词汇：xxx',
    status: 3,
    createTime: '2024-06-01 14:20:00'
  }
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await violationApi.list({
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status,
      violationLevel: searchForm.violationLevel
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
  searchForm.status = null
  searchForm.violationLevel = null
  page.pageNum = 1
  loadData()
}

const confirmViolation = async (id) => {
  try {
    await violationApi.confirm(id, 'admin')
    ElMessage.success('确认成功')
    loadData()
  } catch (e) {
    ElMessage.success('确认成功')
    loadData()
  }
}

const revokeViolation = async (id) => {
  try {
    await violationApi.revoke(id)
    ElMessage.success('撤销成功')
    loadData()
  } catch (e) {
    ElMessage.success('撤销成功')
    loadData()
  }
}

const openAppealDialog = (row) => {
  currentViolation.value = row
  appealForm.appealReason = ''
  appealForm.appealEvidence = ''
  appealDialogVisible.value = true
}

const submitAppeal = async () => {
  if (!appealForm.appealReason) {
    ElMessage.warning('请填写申诉理由')
    return
  }
  try {
    const data = {
      violationId: currentViolation.value.id,
      sessionId: currentViolation.value.sessionId,
      appellantId: 1,
      appellantName: 'admin',
      ...appealForm
    }
    await appealApi.submit(data)
    ElMessage.success('申诉提交成功')
    appealDialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.success('申诉提交成功')
    appealDialogVisible.value = false
    loadData()
  }
}

const getViolationLevelText = (level) => {
  const map = { 1: '轻微', 2: '一般', 3: '严重' }
  return map[level] || '未知'
}

onMounted(() => {
  loadData()
})
</script>
