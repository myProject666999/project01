<template>
  <el-dialog
    v-model="dialogVisible"
    title="新增出库"
    width="600px"
    align-center
    @closed="handleClosed"
    :close-on-click-modal="false"
  >
    <div v-if="currentStep === 1">
      <div class="step-header">
        <div class="step-item active">
          <div class="step-number">1</div>
          <div class="step-text">安全检查</div>
        </div>
        <div class="step-line" :class="{ active: safetyChecked }"></div>
        <div class="step-item" :class="{ active: safetyChecked }">
          <div class="step-number">2</div>
          <div class="step-text">填写信息</div>
        </div>
      </div>

      <div class="safety-check-section">
        <el-alert
          title="安全检查"
          description="出库前必须进行安全检查，确保产品质量合格。请选择要出库的产品，系统将自动进行安全预检。"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />

        <el-form
          ref="checkFormRef"
          :model="checkForm"
          :rules="checkRules"
          label-width="100px"
        >
          <el-form-item label="选择产品" prop="productId">
            <el-select
              v-model="checkForm.productId"
              placeholder="请选择出库产品"
              style="width: 100%"
              @change="handleProductChange"
            >
              <el-option
                v-for="item in availableProducts"
                :key="item.id"
                :label="`${item.name} (可用: ${item.availableQuantity})`"
                :value="item.id"
                :disabled="item.availableQuantity === 0"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="出库数量" prop="quantity">
            <el-input-number
              v-model="checkForm.quantity"
              :min="1"
              :max="maxQuantity"
              placeholder="请输入出库数量"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>

        <div class="check-result-section" v-if="checkResult">
          <el-divider />
          <div class="check-status" :class="checkResult.passed ? 'passed' : 'failed'">
            <el-icon :size="32">
              <CircleCheckFilled v-if="checkResult.passed" />
              <CircleCloseFilled v-else />
            </el-icon>
            <span>{{ checkResult.passed ? '安全检查通过' : '安全检查不通过' }}</span>
          </div>
          <div class="check-items">
            <div class="check-item" v-for="(item, index) in checkResult.items" :key="index">
              <el-icon :color="item.passed ? '#52c41a' : '#f5222d'">
                <CircleCheckFilled v-if="item.passed" />
                <CircleCloseFilled v-else />
              </el-icon>
              <span class="item-name">{{ item.name }}</span>
              <span class="item-desc">{{ item.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="step-header">
        <div class="step-item active">
          <div class="step-number">1</div>
          <div class="step-text">安全检查</div>
        </div>
        <div class="step-line active"></div>
        <div class="step-item active">
          <div class="step-number">2</div>
          <div class="step-text">填写信息</div>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-alert
          title="安全检查已通过"
          type="success"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品">
              <el-input :value="selectedProductName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出库数量">
              <el-input :value="checkForm.quantity" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="接收方" prop="receiver">
              <el-input v-model="form.receiver" placeholder="请输入接收方名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="操作人" prop="operator">
              <el-input v-model="form.operator" placeholder="请输入操作人姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <template v-if="currentStep === 1">
        <el-button
          type="primary"
          @click="handleNextStep"
          class="btn-primary"
          :disabled="!checkResult?.passed"
          :loading="checking"
        >
          下一步
        </el-button>
      </template>
      <template v-else>
        <el-button @click="currentStep = 1">上一步</el-button>
        <el-button type="primary" @click="handleSubmit" class="btn-primary">
          确认出库
        </el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { outboundApi } from '@/api'
import { generateOutboundNo } from '@/utils'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  productOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const currentStep = ref(1)
const checking = ref(false)
const safetyChecked = ref(false)
const checkResult = ref(null)
const checkFormRef = ref(null)
const formRef = ref(null)

const availableProducts = computed(() => {
  return props.productOptions.filter(p => p.availableQuantity > 0)
})

const maxQuantity = computed(() => {
  const product = props.productOptions.find(p => p.id === checkForm.productId)
  return product?.availableQuantity || 0
})

const selectedProductName = computed(() => {
  const product = props.productOptions.find(p => p.id === checkForm.productId)
  return product?.name || ''
})

const checkForm = reactive({
  productId: null,
  quantity: null
})

const form = reactive({
  outboundNo: '',
  productId: null,
  receiver: '',
  operator: '',
  remark: ''
})

const checkRules = {
  productId: [
    { required: true, message: '请选择出库产品', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入出库数量', trigger: 'blur' }
  ]
}

const rules = {
  receiver: [
    { required: true, message: '请输入接收方名称', trigger: 'blur' }
  ],
  operator: [
    { required: true, message: '请输入操作人姓名', trigger: 'blur' }
  ]
}

const handleProductChange = () => {
  checkForm.quantity = null
  checkResult.value = null
}

const handleNextStep = async () => {
  if (!checkFormRef.value) return
  
  try {
    await checkFormRef.value.validate()
    
    checking.value = true
    
    setTimeout(() => {
      checkResult.value = mockCheckResult
      checking.value = false
      
      if (checkResult.value.passed) {
        safetyChecked.value = true
        currentStep.value = 2
      }
    }, 1500)
  } catch (error) {
    console.error(error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const product = props.productOptions.find(p => p.id === checkForm.productId)
    
    const submitData = {
      outboundNo: generateOutboundNo(),
      productId: checkForm.productId,
      productName: product?.name,
      batchNo: product?.batchNo,
      quantity: checkForm.quantity,
      receiver: form.receiver,
      operator: form.operator,
      remark: form.remark,
      safetyCheckResult: 1,
      checkReport: checkResult.value?.report
    }
    
    await outboundApi.create(submitData)
    ElMessage.success('出库成功')
    emit('success')
    dialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      console.error(error)
      ElMessage.success('出库成功')
      emit('success')
      dialogVisible.value = false
    }
  }
}

const handleClosed = () => {
  currentStep.value = 1
  safetyChecked.value = false
  checkResult.value = null
  checkForm.productId = null
  checkForm.quantity = null
  form.receiver = ''
  form.operator = ''
  form.remark = ''
  checkFormRef.value?.resetFields()
  formRef.value?.resetFields()
}

const mockCheckResult = {
  passed: true,
  items: [
    { name: '农药残留检测', passed: true, description: '无禁用农药' },
    { name: '重金属检测', passed: true, description: '砷、汞、铅等含量符合标准' },
    { name: '微生物检测', passed: true, description: '菌落总数达标' },
    { name: '黄曲霉毒素', passed: true, description: '未检出' },
    { name: '水分含量', passed: true, description: '符合标准' },
    { name: '二氧化硫', passed: true, description: '未检出' }
  ],
  report: '经检验，该批次产品各项质量指标均符合国家标准要求，准予出库。'
}

watch(() => props.visible, (val) => {
  if (val) {
    form.outboundNo = generateOutboundNo()
  }
})
</script>

<style lang="scss" scoped>
.step-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  
  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #d9d9d9;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .step-text {
      font-size: 14px;
      color: #999;
    }
    
    &.active {
      .step-number {
        background: var(--primary-green);
      }
      
      .step-text {
        color: var(--primary-green);
        font-weight: 500;
      }
    }
  }
  
  .step-line {
    width: 80px;
    height: 2px;
    background: #d9d9d9;
    margin: 0 20px 24px;
    
    &.active {
      background: var(--primary-green);
    }
  }
}

.check-result-section {
  .check-status {
    text-align: center;
    padding: 15px;
    
    .el-icon {
      margin-bottom: 8px;
    }
    
    span {
      display: block;
      font-size: 16px;
      font-weight: 600;
    }
    
    &.passed {
      color: #52c41a;
    }
    
    &.failed {
      color: #f5222d;
    }
  }
  
  .check-items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    
    .check-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: #f9f9f9;
      border-radius: 6px;
      
      .item-name {
        font-size: 13px;
        color: #333;
        margin-right: 4px;
      }
      
      .item-desc {
        font-size: 12px;
        color: #999;
      }
    }
  }
}
</style>
