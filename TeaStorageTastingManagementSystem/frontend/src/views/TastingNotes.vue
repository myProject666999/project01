<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">品鉴笔记</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增笔记</el-button>
    </div>

    <div class="filter-bar">
      <el-select v-model="filters.tea_product_id" placeholder="选择茶品" clearable filterable style="width: 200px;">
        <el-option
          v-for="product in teaProducts"
          :key="product.id"
          :label="product.product_name + ' (' + product.production_year + ')'"
          :value="product.id"
        />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        placeholder="选择日期范围"
        value-format="YYYY-MM-DD"
      />
      <el-button type="primary" @click="loadData">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="teaProduct.product_name" label="茶品名称" width="150" />
        <el-table-column prop="teaProduct.production_year" label="年份" width="80" />
        <el-table-column prop="tasting_date" label="品鉴日期" width="120" />
        <el-table-column prop="tea_weight" label="克重(g)" width="80" />
        <el-table-column prop="water_type" label="用水" width="80">
          <template #default="{ row }">
            {{ row.water_type === 'pure' ? '纯净水' : '矿泉水' }}
          </template>
        </el-table-column>
        <el-table-column prop="brew_count" label="冲泡次数" width="80" />
        <el-table-column prop="overall_score" label="评分" width="80">
          <template #default="{ row }">
            <el-tag :type="getScoreType(row.overall_score)">{{ row.overall_score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="评价" show-overflow-tooltip />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewCurve(row.tea_product_id)">转化曲线</el-button>
            <el-button type="success" size="small" @click="handleView(row)">查看</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑笔记' : '新增笔记'" width="800px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="茶品" prop="tea_product_id">
          <el-select
            v-model="form.tea_product_id"
            placeholder="请选择茶品"
            filterable
            style="width: 100%;"
          >
            <el-option
              v-for="product in teaProducts"
              :key="product.id"
              :label="product.product_name + ' (' + product.production_year + ')'"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="品鉴日期" prop="tasting_date">
              <el-date-picker
                v-model="form.tasting_date"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="撬茶克重" prop="tea_weight">
              <el-input v-model.number="form.tea_weight" placeholder="如：7.5" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用水类型" prop="water_type">
              <el-select v-model="form.water_type" style="width: 100%;">
                <el-option label="纯净水" value="pure" />
                <el-option label="矿泉水" value="mineral" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="冲泡次数" prop="brew_count">
              <el-input v-model.number="form.brew_count" placeholder="如：8" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="总体评价">
          <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入总体评价" />
        </el-form-item>
        
        <el-divider>冲泡详情</el-divider>
        
        <div style="margin-bottom: 15px;">
          <el-button type="primary" size="small" :icon="Plus" @click="addInfusion">添加一泡</el-button>
        </div>
        
        <div v-for="(infusion, index) in form.infusions" :key="index" class="infusion-item">
          <div class="infusion-header">
            <span class="infusion-number">第 {{ infusion.infusion_number }} 泡</span>
            <el-button type="danger" size="small" :icon="Delete" @click="removeInfusion(index)" circle />
          </div>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="评分" :prop="'infusions.' + index + '.score'">
                <el-input v-model.number="infusion.score" placeholder="0-100" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="汤色">
                <el-input v-model="infusion.soup_color" placeholder="如：橙红明亮" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="香气">
                <el-input v-model="infusion.aroma" placeholder="描述香气特点" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="滋味">
                <el-input v-model="infusion.taste" type="textarea" :rows="2" placeholder="描述滋味特点" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="品鉴详情" width="700px">
      <div v-if="currentNote" class="detail-content">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="茶品">{{ currentNote.teaProduct?.product_name }}</el-descriptions-item>
          <el-descriptions-item label="年份">{{ currentNote.teaProduct?.production_year }}</el-descriptions-item>
          <el-descriptions-item label="品鉴日期">{{ currentNote.tasting_date }}</el-descriptions-item>
          <el-descriptions-item label="克重">{{ currentNote.tea_weight }}g</el-descriptions-item>
          <el-descriptions-item label="用水">{{ currentNote.water_type === 'pure' ? '纯净水' : '矿泉水' }}</el-descriptions-item>
          <el-descriptions-item label="冲泡次数">{{ currentNote.brew_count }}</el-descriptions-item>
          <el-descriptions-item label="总体评分">
            <el-tag :type="getScoreType(currentNote.overall_score)" size="large">
              {{ currentNote.overall_score }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总体评价" :span="2">{{ currentNote.notes }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider>冲泡详情</el-divider>
        
        <div v-for="infusion in currentNote.tastingNote" :key="infusion.id" class="infusion-item">
          <div class="infusion-header">
            <span class="infusion-number">第 {{ infusion.infusion_number }} 泡</span>
            <el-tag :type="getScoreType(infusion.score)">评分：{{ infusion.score }}</el-tag>
          </div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="汤色">{{ infusion.soup_color }}</el-descriptions-item>
            <el-descriptions-item label="香气">{{ infusion.aroma }}</el-descriptions-item>
            <el-descriptions-item label="滋味" :span="2">{{ infusion.taste }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { getTastingNotes, createTastingNote, deleteTastingNote, getTastingNote } from '../api/tastingNotes'
import { getTeaProducts } from '../api/teaProducts'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const teaProducts = ref([])
const currentNote = ref(null)
const dateRange = ref([])

const filters = reactive({
  tea_product_id: '',
  start_date: '',
  end_date: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const form = reactive({
  id: null,
  tea_product_id: null,
  tasting_date: '',
  tea_weight: 7.5,
  water_type: 'pure',
  brew_count: 8,
  notes: '',
  infusions: []
})

const rules = {
  tea_product_id: [{ required: true, message: '请选择茶品', trigger: 'change' }],
  tasting_date: [{ required: true, message: '请选择品鉴日期', trigger: 'change' }],
  tea_weight: [{ required: true, message: '请输入克重', trigger: 'blur' }],
  water_type: [{ required: true, message: '请选择用水类型', trigger: 'change' }],
  brew_count: [{ required: true, message: '请输入冲泡次数', trigger: 'blur' }]
}

const getScoreType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'warning'
  return 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    const res = await getTastingNotes(params)
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const loadTeaProducts = async () => {
  try {
    const res = await getTeaProducts({ pageSize: 1000 })
    teaProducts.value = res.data.list
  } catch (error) {
    console.error('加载茶品失败:', error)
  }
}

const resetFilters = () => {
  filters.tea_product_id = ''
  filters.start_date = ''
  filters.end_date = ''
  dateRange.value = []
  pagination.page = 1
  loadData()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadData()
}

const handleCurrentChange = (page) => {
  pagination.page = page
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    tea_product_id: null,
    tasting_date: new Date().toISOString().split('T')[0],
    tea_weight: 7.5,
    water_type: 'pure',
    brew_count: 8,
    notes: '',
    infusions: [
      { infusion_number: 1, soup_color: '', aroma: '', taste: '', score: 80 }
    ]
  })
  dialogVisible.value = true
}

const handleView = async (row) => {
  try {
    const res = await getTastingNote(row.id)
    currentNote.value = res.data
    detailDialogVisible.value = true
  } catch (error) {
    console.error('加载详情失败:', error)
  }
}

const addInfusion = () => {
  const nextNumber = form.infusions.length + 1
  form.infusions.push({
    infusion_number: nextNumber,
    soup_color: '',
    aroma: '',
    taste: '',
    score: 80
  })
}

const removeInfusion = (index) => {
  form.infusions.splice(index, 1)
  form.infusions.forEach((inf, i) => {
    inf.infusion_number = i + 1
  })
}

const viewCurve = (id) => {
  router.push(`/conversion-curve/${id}`)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          ElMessage.success('更新成功')
        } else {
          await createTastingNote(form)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        console.error('提交失败:', error)
      }
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除该品鉴笔记吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteTastingNote(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
  loadTeaProducts()
})
</script>
