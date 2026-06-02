<template>
  <div class="work-hour-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工时账单</span>
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            添加工时
          </el-button>
        </div>
      </template>

      <el-row :gutter="20" class="filter-row">
        <el-col :span="6">
          <el-select v-model="filter.lawyerId" placeholder="选择律师" clearable style="width: 100%">
            <el-option
              v-for="lawyer in lawyers"
              :key="lawyer.id"
              :label="lawyer.name"
              :value="lawyer.id"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="filter.yearMonth"
            type="month"
            placeholder="选择月份"
            style="width: 100%"
            value-format="YYYY-MM"
          />
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="loadMonthlyBill">查询账单</el-button>
          <el-button @click="exportBill">导出账单</el-button>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="summary-row" v-if="monthlyBill">
        <el-col :span="8">
          <el-statistic title="总时长(分钟)" :value="monthlyBill.totalMinutes" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="计费单元" :value="monthlyBill.totalBillingUnits" />
        </el-col>
        <el-col :span="8">
          <el-statistic title="总金额(元)" :value="monthlyBill.totalAmount" :precision="2" />
        </el-col>
      </el-row>

      <el-table :data="workHours" border stripe style="width: 100%; margin-top: 20px">
        <el-table-column prop="workDate" label="工作日期" width="120">
          <template #default="{ row }">{{ formatDate(row.workDate) }}</template>
        </el-table-column>
        <el-table-column prop="workType" label="工作类型" width="120" />
        <el-table-column prop="workContent" label="工作内容" min-width="200" />
        <el-table-column prop="workMinutes" label="时长(分钟)" width="100" align="right" />
        <el-table-column prop="billingUnits" label="计费单元" width="100" align="right">
          <template #default="{ row }">
            <el-tag type="info">{{ row.billingUnits }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hourlyRate" label="费率(元/小时)" width="120" align="right" />
        <el-table-column prop="totalAmount" label="金额(元)" width="120" align="right">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 600">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="deleteWorkHour(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="addDialogVisible" title="添加工时记录" width="500px">
      <el-form :model="newWorkHour" label-width="100px" :rules="workHourRules" ref="workHourFormRef">
        <el-form-item label="选择案件" prop="caseId">
          <el-select v-model="newWorkHour.caseId" placeholder="请选择案件" style="width: 100%">
            <el-option
              v-for="c in cases"
              :key="c.id"
              :label="`${c.caseNumber} - ${c.caseName}`"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择律师" prop="lawyerId">
          <el-select v-model="newWorkHour.lawyerId" placeholder="请选择律师" style="width: 100%">
            <el-option
              v-for="lawyer in lawyers"
              :key="lawyer.id"
              :label="lawyer.name"
              :value="lawyer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工作日期" prop="workDate">
          <el-date-picker v-model="newWorkHour.workDate" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="工作类型" prop="workType">
          <el-select v-model="newWorkHour.workType" placeholder="请选择工作类型" style="width: 100%">
            <el-option label="文书撰写" value="文书撰写" />
            <el-option label="调查取证" value="调查取证" />
            <el-option label="会见" value="会见" />
            <el-option label="出庭" value="出庭" />
            <el-option label="咨询" value="咨询" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="工作时长(分钟)" prop="workMinutes">
          <el-input-number v-model="newWorkHour.workMinutes" :min="1" style="width: 100%" />
          <div style="color: #909399; font-size: 12px; margin-top: 5px">
            计费单元: {{ Math.ceil(newWorkHour.workMinutes / 6) || 0 }} (每6分钟一个单元)
          </div>
        </el-form-item>
        <el-form-item label="工作内容" prop="workContent">
          <el-input v-model="newWorkHour.workContent" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addWorkHour">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { lawyerApi, caseApi, workHourApi } from '../api'

const workHourFormRef = ref()
const lawyers = ref([])
const cases = ref([])
const workHours = ref([])
const monthlyBill = ref(null)
const addDialogVisible = ref(false)

const filter = reactive({
  lawyerId: null,
  yearMonth: new Date().toISOString().slice(0, 7)
})

const newWorkHour = ref({
  caseId: null,
  lawyerId: null,
  workDate: new Date().toISOString().slice(0, 10),
  workType: '',
  workMinutes: 30,
  workContent: ''
})

const workHourRules = {
  caseId: [{ required: true, message: '请选择案件', trigger: 'change' }],
  lawyerId: [{ required: true, message: '请选择律师', trigger: 'change' }],
  workDate: [{ required: true, message: '请选择日期', trigger: 'change' }],
  workType: [{ required: true, message: '请选择工作类型', trigger: 'change' }],
  workMinutes: [{ required: true, message: '请输入工作时长', trigger: 'blur' }]
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadLawyers = async () => {
  try {
    lawyers.value = await lawyerApi.getActive()
  } catch (error) {
    console.error('加载律师列表失败:', error)
  }
}

const loadCases = async () => {
  try {
    cases.value = await caseApi.getAll()
  } catch (error) {
    console.error('加载案件列表失败:', error)
  }
}

const loadWorkHours = async () => {
  try {
    workHours.value = await workHourApi.getAll()
  } catch (error) {
    console.error('加载工时记录失败:', error)
  }
}

const loadMonthlyBill = async () => {
  if (!filter.lawyerId || !filter.yearMonth) return
  const [year, month] = filter.yearMonth.split('-').map(Number)
  try {
    monthlyBill.value = await workHourApi.getMonthlyBill(filter.lawyerId, year, month)
    workHours.value = monthlyBill.value.workHours || []
  } catch (error) {
    console.error('加载月度账单失败:', error)
  }
}

const showAddDialog = () => {
  addDialogVisible.value = true
}

const addWorkHour = async () => {
  if (!workHourFormRef.value) return
  await workHourFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      await workHourApi.create(newWorkHour.value)
      ElMessage.success('工时记录添加成功')
      addDialogVisible.value = false
      loadWorkHours()
      newWorkHour.value = {
        caseId: null,
        lawyerId: null,
        workDate: new Date().toISOString().slice(0, 10),
        workType: '',
        workMinutes: 30,
        workContent: ''
      }
    } catch (error) {
      ElMessage.error('工时记录添加失败')
    }
  })
}

const deleteWorkHour = async (id) => {
  try {
    await workHourApi.delete(id)
    ElMessage.success('删除成功')
    loadWorkHours()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const exportBill = async () => {
  if (!filter.lawyerId || !filter.yearMonth) {
    ElMessage.warning('请先选择律师和月份')
    return
  }
  const [year, month] = filter.yearMonth.split('-').map(Number)
  try {
    const response = await workHourApi.exportMonthlyBill(filter.lawyerId, year, month)
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${year}年${month}月工时账单.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  loadLawyers()
  loadCases()
  loadWorkHours()
})
</script>

<style scoped>
.work-hour-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-row {
  margin-bottom: 20px;
}

.summary-row {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>
