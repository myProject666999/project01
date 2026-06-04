<template>
  <div>
    <el-card shadow="never" style="margin-bottom: 16px">
      <h2 style="margin: 0; font-size: 20px">分拣管理</h2>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>分拣口列表</span>
              <el-button type="primary" size="small" @click="portDialogVisible = true">新增分拣口</el-button>
            </div>
          </template>
          <el-table :data="ports" stripe border size="small">
            <el-table-column prop="port_code" label="编号" width="80" />
            <el-table-column prop="port_name" label="名称" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'" size="small">
                  {{ row.status === 'ACTIVE' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>航班查询分拣口</span>
            </div>
          </template>
          <el-form :inline="true" @submit.prevent="handleLookup">
            <el-form-item label="航班号">
              <el-input v-model="lookupFlightNo" placeholder="如 CA1234" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleLookup">查询</el-button>
            </el-form-item>
          </el-form>
          <el-descriptions v-if="lookupResult" :column="1" border size="small">
            <el-descriptions-item label="航班号">{{ lookupResult.flight_no }}</el-descriptions-item>
            <el-descriptions-item label="分拣口">{{ lookupResult.sorting_port?.port_name }} ({{ lookupResult.sorting_port?.port_code }})</el-descriptions-item>
            <el-descriptions-item label="生效时段">{{ formatTime(lookupResult.effective_start) }} ~ {{ formatTime(lookupResult.effective_end) }}</el-descriptions-item>
            <el-descriptions-item label="优先级">{{ lookupResult.priority }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" style="margin-top: 16px">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>分拣规则（航班号→分拣口映射，按时段切换）</span>
          <div style="display: flex; gap: 8px">
            <el-button size="small" @click="loadActiveRules">查看当前生效</el-button>
            <el-button type="primary" size="small" @click="ruleDialogVisible = true">新增规则</el-button>
          </div>
        </div>
      </template>
      <el-table :data="rules" stripe border size="small">
        <el-table-column prop="flight_no" label="航班号" width="100" />
        <el-table-column label="分拣口" width="130">
          <template #default="{ row }">{{ row.sorting_port?.port_name || '-' }} ({{ row.sorting_port?.port_code || '-' }})</template>
        </el-table-column>
        <el-table-column label="生效开始" width="180">
          <template #default="{ row }">{{ formatTime(row.effective_start) }}</template>
        </el-table-column>
        <el-table-column label="生效结束" width="180">
          <template #default="{ row }">{{ formatTime(row.effective_end) }}</template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80" />
      </el-table>
    </el-card>

    <el-dialog v-model="portDialogVisible" title="新增分拣口" width="400px">
      <el-form :model="portForm" label-width="80px">
        <el-form-item label="编号"><el-input v-model="portForm.port_code" placeholder="如 P09" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="portForm.port_name" placeholder="如 9号滑槽" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="portDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreatePort">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="ruleDialogVisible" title="新增分拣规则" width="500px">
      <el-form :model="ruleForm" label-width="100px">
        <el-form-item label="航班号"><el-input v-model="ruleForm.flight_no" placeholder="如 CA1234" /></el-form-item>
        <el-form-item label="分拣口">
          <el-select v-model="ruleForm.port_id" placeholder="请选择">
            <el-option v-for="p in ports" :key="p.id" :label="`${p.port_name} (${p.port_code})`" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="生效开始"><el-input v-model="ruleForm.effective_start" placeholder="2026-06-04 06:00:00" /></el-form-item>
        <el-form-item label="生效结束"><el-input v-model="ruleForm.effective_end" placeholder="2026-06-04 10:00:00" /></el-form-item>
        <el-form-item label="优先级"><el-input-number v-model="ruleForm.priority" :min="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateRule">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSortingPorts, createSortingPort, getSortingRules, getActiveRules, createSortingRule, lookupSortingPort } from '../api'
import { ElMessage } from 'element-plus'

const ports = ref([])
const rules = ref([])
const lookupFlightNo = ref('')
const lookupResult = ref(null)

const portDialogVisible = ref(false)
const portForm = ref({ port_code: '', port_name: '' })

const ruleDialogVisible = ref(false)
const ruleForm = ref({ flight_no: '', port_id: null, effective_start: '', effective_end: '', priority: 0 })

const formatTime = (t) => t ? new Date(t).toLocaleString('zh-CN') : '-'

async function loadPorts() { ports.value = await getSortingPorts() }
async function loadRules() { rules.value = await getSortingRules() }

async function loadActiveRules() {
  rules.value = await getActiveRules()
  ElMessage.success('已刷新为当前生效规则')
}

async function handleLookup() {
  if (!lookupFlightNo.value) { ElMessage.warning('请输入航班号'); return }
  try {
    lookupResult.value = await lookupSortingPort(lookupFlightNo.value)
  } catch (e) {
    lookupResult.value = null
    ElMessage.error('未找到对应分拣口')
  }
}

async function handleCreatePort() {
  try {
    await createSortingPort(portForm.value)
    ElMessage.success('分拣口创建成功')
    portDialogVisible.value = false
    portForm.value = { port_code: '', port_name: '' }
    loadPorts()
  } catch (e) { ElMessage.error('创建失败') }
}

async function handleCreateRule() {
  try {
    await createSortingRule(ruleForm.value)
    ElMessage.success('分拣规则创建成功')
    ruleDialogVisible.value = false
    ruleForm.value = { flight_no: '', port_id: null, effective_start: '', effective_end: '', priority: 0 }
    loadRules()
  } catch (e) { ElMessage.error('创建失败') }
}

onMounted(() => { loadPorts(); loadRules() })
</script>
