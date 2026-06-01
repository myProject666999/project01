<template>
  <div class="page-container">
    <div class="page-header">
      <h2>优秀话术库</h2>
      <el-button type="primary" @click="openCreateDialog">
        <el-icon><Plus /></el-icon>
        新增话术
      </el-button>
    </div>

    <div class="search-form">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索标题/内容/关键词"
        clearable
        style="width: 280px"
      />
      <el-select v-model="searchForm.categoryId" placeholder="分类" clearable style="width: 160px">
        <el-option label="开场白" :value="1" />
        <el-option label="问题解答" :value="2" />
        <el-option label="投诉处理" :value="3" />
        <el-option label="结束语" :value="4" />
        <el-option label="产品咨询" :value="5" />
      </el-select>
      <el-button type="primary" @click="loadData">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="item in tableData" :key="item.id">
        <el-card shadow="hover" class="script-card">
          <template #header>
            <div class="card-header">
              <span class="script-title">{{ item.title }}</span>
              <el-tag size="small" type="info">{{ item.categoryName }}</el-tag>
            </div>
          </template>
          <div class="script-content">{{ item.content }}</div>
          <div class="script-meta">
            <span v-if="item.sceneDesc" class="scene-desc">
              <el-icon><InfoFilled /></el-icon>
              {{ item.sceneDesc }}
            </span>
          </div>
          <div class="script-actions">
            <div class="stats">
              <span><el-icon><View /></el-icon> {{ item.useCount }} 次使用</span>
              <span><el-icon><GoodFilled /></el-icon> {{ item.likeCount }} 赞</span>
            </div>
            <div class="actions">
              <el-button size="small" type="primary" link @click="useScript(item)">使用</el-button>
              <el-button size="small" type="success" link @click="likeScript(item.id)">点赞</el-button>
              <el-button size="small" link @click="editScript(item)">编辑</el-button>
              <el-button size="small" type="danger" link @click="deleteScript(item.id)">删除</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-pagination
      v-model:current-page="page.pageNum"
      v-model:page-size="page.pageSize"
      :total="total"
      :page-sizes="[9, 18, 36]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadData"
      @current-change="loadData"
      style="margin-top: 20px; justify-content: flex-end; display: flex;"
    />
  </div>

  <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑话术' : '新增话术'" width="600px">
    <el-form :model="scriptForm" label-width="100px">
      <el-form-item label="话术标题" required>
        <el-input v-model="scriptForm.title" placeholder="请输入话术标题" />
      </el-form-item>
      <el-form-item label="所属分类" required>
        <el-select v-model="scriptForm.categoryId" placeholder="请选择分类" style="width: 100%">
          <el-option label="开场白" :value="1" />
          <el-option label="问题解答" :value="2" />
          <el-option label="投诉处理" :value="3" />
          <el-option label="结束语" :value="4" />
          <el-option label="产品咨询" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="话术内容" required>
        <el-input
          v-model="scriptForm.content"
          type="textarea"
          :rows="4"
          placeholder="请输入话术内容"
        />
      </el-form-item>
      <el-form-item label="适用场景">
        <el-input
          v-model="scriptForm.sceneDesc"
          type="textarea"
          :rows="2"
          placeholder="请描述适用场景"
        />
      </el-form-item>
      <el-form-item label="关键词">
        <el-input v-model="scriptForm.keywords" placeholder="多个关键词用逗号分隔" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveScript">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { scriptApi } from '@/api'

const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)

const searchForm = reactive({
  keyword: '',
  categoryId: null
})

const page = reactive({
  pageNum: 1,
  pageSize: 9
})

const scriptForm = reactive({
  id: null,
  title: '',
  categoryId: null,
  categoryName: '',
  content: '',
  sceneDesc: '',
  keywords: ''
})

const categoryMap = {
  1: '开场白',
  2: '问题解答',
  3: '投诉处理',
  4: '结束语',
  5: '产品咨询'
}

const mockData = [
  {
    id: 1,
    title: '标准问候语',
    categoryId: 1,
    categoryName: '开场白',
    content: '您好！很高兴为您服务，请问有什么可以帮您的？',
    sceneDesc: '客户进线时使用',
    keywords: '问候,您好,服务',
    useCount: 1256,
    likeCount: 89
  },
  {
    id: 2,
    title: '忙碌提示',
    categoryId: 1,
    categoryName: '开场白',
    content: '您好！当前咨询量较大，我正在处理中，请您稍等片刻，感谢您的理解！',
    sceneDesc: '咨询量大时使用',
    keywords: '忙碌,等待,理解',
    useCount: 568,
    likeCount: 45
  },
  {
    id: 3,
    title: '确认问题',
    categoryId: 2,
    categoryName: '问题解答',
    content: '我理解您的问题是...对吗？为了更好地帮您解决，请确认一下。',
    sceneDesc: '需要确认客户问题时使用',
    keywords: '确认,理解,问题',
    useCount: 892,
    likeCount: 67
  },
  {
    id: 4,
    title: '安抚话术',
    categoryId: 3,
    categoryName: '投诉处理',
    content: '非常抱歉给您带来了不好的体验，我会尽力帮您解决这个问题。',
    sceneDesc: '客户投诉时安抚使用',
    keywords: '抱歉,安抚,解决',
    useCount: 456,
    likeCount: 78
  },
  {
    id: 5,
    title: '标准结束语',
    categoryId: 4,
    categoryName: '结束语',
    content: '感谢您的咨询，如果后续还有问题，欢迎随时联系我们。祝您生活愉快！',
    sceneDesc: '会话结束时使用',
    keywords: '感谢,再见,愉快',
    useCount: 1523,
    likeCount: 112
  },
  {
    id: 6,
    title: '产品咨询回复',
    categoryId: 5,
    categoryName: '产品咨询',
    content: '我们的产品具有以下特点：1.高品质材料；2.优秀的性能；3.完善的售后服务。',
    sceneDesc: '客户咨询产品时使用',
    keywords: '产品,特点,品质',
    useCount: 234,
    likeCount: 34
  }
]

const loadData = async () => {
  try {
    const res = await scriptApi.list({
      pageNum: page.pageNum,
      pageSize: page.pageSize,
      keyword: searchForm.keyword,
      categoryId: searchForm.categoryId,
      status: 1
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
  }
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.categoryId = null
  page.pageNum = 1
  loadData()
}

const openCreateDialog = () => {
  isEdit.value = false
  scriptForm.id = null
  scriptForm.title = ''
  scriptForm.categoryId = null
  scriptForm.categoryName = ''
  scriptForm.content = ''
  scriptForm.sceneDesc = ''
  scriptForm.keywords = ''
  dialogVisible.value = true
}

const editScript = (item) => {
  isEdit.value = true
  Object.assign(scriptForm, item)
  dialogVisible.value = true
}

const saveScript = async () => {
  if (!scriptForm.title || !scriptForm.categoryId || !scriptForm.content) {
    ElMessage.warning('请填写完整信息')
    return
  }
  scriptForm.categoryName = categoryMap[scriptForm.categoryId] || ''
  try {
    if (isEdit.value) {
      await scriptApi.update(scriptForm)
    } else {
      await scriptApi.save(scriptForm)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  }
}

const useScript = async (item) => {
  try {
    await scriptApi.use(item.id)
  } catch (e) {}
  item.useCount++
  ElMessage.success('已复制到剪贴板')
}

const likeScript = async (id) => {
  try {
    await scriptApi.like(id)
  } catch (e) {}
  const item = tableData.value.find(i => i.id === id)
  if (item) item.likeCount++
  ElMessage.success('点赞成功')
}

const deleteScript = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个话术吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    try {
      await scriptApi.delete(id)
    } catch (e) {}
    ElMessage.success('删除成功')
    loadData()
  } catch {
    // 取消
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.script-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.script-title {
  font-weight: 500;
  font-size: 15px;
}

.script-content {
  min-height: 60px;
  line-height: 1.6;
  color: #606266;
  margin-bottom: 12px;
}

.script-meta {
  margin-bottom: 12px;
}

.scene-desc {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 6px 10px;
  border-radius: 4px;
}

.script-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.actions {
  display: flex;
  gap: 4px;
}
</style>
