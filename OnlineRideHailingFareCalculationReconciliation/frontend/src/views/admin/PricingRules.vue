<template>
  <div class="pricing-rules">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>计价规则管理</span>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            新增规则
          </el-button>
        </div>
      </template>
      
      <el-table :data="rules" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="rule_name" label="规则名称" width="150" />
        <el-table-column prop="base_fare" label="起步价(元)" width="120" />
        <el-table-column prop="base_km" label="起步里程(km)" width="120" />
        <el-table-column prop="per_km_fare" label="每公里单价(元)" width="140" />
        <el-table-column prop="free_wait_minutes" label="免费等候(分钟)" width="130" />
        <el-table-column prop="per_minute_wait_fare" label="等候单价(元/分钟)" width="150" />
        <el-table-column label="夜间加价" width="100">
          <template #default="{ row }">
            {{ (row.night_surcharge_rate * 100).toFixed(0) }}%
          </template>
        </el-table-column>
        <el-table-column label="夜间时段" width="150">
          <template #default="{ row }">
            {{ row.night_start_hour }}:00 - {{ row.night_end_hour }}:00
          </template>
        </el-table-column>
        <el-table-column prop="is_active" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.is_active" type="success">启用中</el-tag>
            <el-tag v-else type="info">未启用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="editRule(row)">
              编辑
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              link 
              @click="setActive(row)"
              v-if="!row.is_active"
            >
              设为启用
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card style="margin-top: 20px;">
      <template #header>
        <span>计价测试</span>
      </template>
      <el-form :model="testForm" :inline="true" label-width="100px">
        <el-form-item label="行驶里程">
          <el-input-number v-model="testForm.distance" :min="0" :step="0.1" />
          <span style="margin-left: 5px;">公里</span>
        </el-form-item>
        <el-form-item label="等候时间">
          <el-input-number v-model="testForm.waitMinutes" :min="0" />
          <span style="margin-left: 5px;">分钟</span>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="testForm.startTime"
            type="datetime"
            placeholder="选择时间"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="calculateFare">计算价格</el-button>
        </el-form-item>
      </el-form>
      <div v-if="testResult !== null" class="test-result">
        <el-alert
          :title="`计算结果：¥${testResult}`"
          type="success"
          show-icon
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑规则' : '新增规则'" width="600px">
      <el-form :model="ruleForm" label-width="150px">
        <el-form-item label="规则名称">
          <el-input v-model="ruleForm.rule_name" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="起步价(元)">
          <el-input-number v-model="ruleForm.base_fare" :min="0" :step="0.5" />
        </el-form-item>
        <el-form-item label="起步里程(km)">
          <el-input-number v-model="ruleForm.base_km" :min="0" :step="0.1" />
        </el-form-item>
        <el-form-item label="每公里单价(元)">
          <el-input-number v-model="ruleForm.per_km_fare" :min="0" :step="0.1" />
        </el-form-item>
        <el-form-item label="免费等候时间(分钟)">
          <el-input-number v-model="ruleForm.free_wait_minutes" :min="0" />
        </el-form-item>
        <el-form-item label="每分钟等候费(元)">
          <el-input-number v-model="ruleForm.per_minute_wait_fare" :min="0" :step="0.1" />
        </el-form-item>
        <el-form-item label="夜间加价比例(%)">
          <el-input-number v-model="ruleForm.night_surcharge_rate" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="夜间开始时间(时)">
          <el-input-number v-model="ruleForm.night_start_hour" :min="0" :max="23" />
        </el-form-item>
        <el-form-item label="夜间结束时间(时)">
          <el-input-number v-model="ruleForm.night_end_hour" :min="0" :max="23" />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-switch v-model="ruleForm.is_active" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pricingApi } from '@/api'

const rules = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const testResult = ref(null)

const ruleForm = ref({
  id: null,
  rule_name: '',
  base_fare: 14,
  base_km: 3,
  per_km_fare: 2.5,
  free_wait_minutes: 5,
  per_minute_wait_fare: 0.5,
  night_surcharge_rate: 30,
  night_start_hour: 23,
  night_end_hour: 5,
  is_active: 0
})

const testForm = ref({
  distance: 5,
  waitMinutes: 10,
  startTime: new Date()
})

onMounted(() => {
  loadRules()
})

const loadRules = async () => {
  loading.value = true
  try {
    const res = await pricingApi.getList()
    rules.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEdit.value = false
  ruleForm.value = {
    id: null,
    rule_name: '',
    base_fare: 14,
    base_km: 3,
    per_km_fare: 2.5,
    free_wait_minutes: 5,
    per_minute_wait_fare: 0.5,
    night_surcharge_rate: 30,
    night_start_hour: 23,
    night_end_hour: 5,
    is_active: 0
  }
  dialogVisible.value = true
}

const editRule = (row) => {
  isEdit.value = true
  ruleForm.value = {
    ...row,
    night_surcharge_rate: row.night_surcharge_rate * 100
  }
  dialogVisible.value = true
}

const saveRule = async () => {
  try {
    const data = {
      ...ruleForm.value,
      night_surcharge_rate: ruleForm.value.night_surcharge_rate / 100
    }
    
    if (isEdit.value) {
      await pricingApi.update(ruleForm.value.id, data)
      ElMessage.success('更新成功')
    } else {
      await pricingApi.create(data)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    loadRules()
  } catch (e) {
    console.error(e)
    ElMessage.error('保存失败')
  }
}

const setActive = async (row) => {
  try {
    await ElMessageBox.confirm('确定要将此规则设为启用吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await pricingApi.setActive(row.id)
    ElMessage.success('设置成功')
    loadRules()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
      ElMessage.error('设置失败')
    }
  }
}

const calculateFare = async () => {
  try {
    const res = await pricingApi.calculate(testForm.value)
    testResult.value = res.data.fare
  } catch (e) {
    console.error(e)
    ElMessage.error('计算失败')
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.test-result {
  margin-top: 20px;
}
</style>
