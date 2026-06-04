<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      :disabled="mode === 'view'"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="批次" prop="batchId">
            <el-select v-model="formData.batchId" placeholder="请选择批次" style="width: 100%">
              <el-option label="HB202409001" value="1" />
              <el-option label="HB202409002" value="2" />
              <el-option label="HB202409003" value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工序类型" prop="stepType">
            <el-select v-model="formData.stepType" placeholder="请选择工序类型" style="width: 100%">
              <el-option label="清洗" value="1" />
              <el-option label="烘干" value="2" />
              <el-option label="切片" value="3" />
              <el-option label="炮制" value="4" />
              <el-option label="筛选" value="5" />
              <el-option label="包装" value="6" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="温度(℃)" prop="temperature">
            <el-input-number v-model="formData.temperature" :min="-20" :max="200" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              placeholder="请选择开始时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              type="datetime"
              placeholder="请选择结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作人" prop="operator">
            <el-input v-model="formData.operator" placeholder="请输入操作人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="投入量(kg)" prop="inputQuantity">
            <el-input-number v-model="formData.inputQuantity" :min="0" :step="0.01" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产出量(kg)" prop="outputQuantity">
            <el-input-number v-model="formData.outputQuantity" :min="0" :step="0.01" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="质检结果" prop="qualityResult">
            <el-select v-model="formData.qualityResult" placeholder="请选择质检结果" style="width: 100%">
              <el-option label="合格" :value="1" />
              <el-option label="不合格" :value="0" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="加工详情" prop="processingDetail">
            <el-input v-model="formData.processingDetail" type="textarea" :rows="3" placeholder="请输入加工详情" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="质检备注" prop="qualityRemark">
            <el-input v-model="formData.qualityRemark" type="textarea" :rows="3" placeholder="请输入质检备注" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button v-if="mode !== 'view'" type="primary" :loading="submitting" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'add',
    validator: (value) => ['add', 'edit', 'view'].includes(value)
  },
  data: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref(null)
const submitting = ref(false)

const dialogTitle = computed(() => {
  const titleMap = { add: '新增加工记录', edit: '编辑加工记录', view: '加工记录详情' }
  return titleMap[props.mode] || '加工记录'
})

const defaultFormData = () => ({
  batchId: '',
  batchNo: '',
  stepType: '',
  startTime: '',
  endTime: '',
  duration: null,
  temperature: null,
  operator: '',
  processingDetail: '',
  inputQuantity: null,
  outputQuantity: null,
  qualityResult: null,
  qualityRemark: ''
})

const formData = ref(defaultFormData())

const rules = {
  batchId: [{ required: true, message: '请选择批次', trigger: 'change' }],
  stepType: [{ required: true, message: '请选择工序类型', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  temperature: [{ required: true, message: '请输入温度', trigger: 'blur' }],
  operator: [{ required: true, message: '请输入操作人', trigger: 'blur' }],
  inputQuantity: [{ required: true, message: '请输入投入量', trigger: 'blur' }],
  outputQuantity: [{ required: true, message: '请输入产出量', trigger: 'blur' }],
  qualityResult: [{ required: true, message: '请选择质检结果', trigger: 'change' }],
  processingDetail: [{ required: true, message: '请输入加工详情', trigger: 'blur' }]
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (props.data) {
        formData.value = { ...defaultFormData(), ...props.data }
      } else {
        formData.value = defaultFormData()
      }
      formRef.value?.clearValidate()
    }
  }
)

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))
        ElMessage.success(props.mode === 'add' ? '新增成功' : '编辑成功')
        emit('success')
      } finally {
        submitting.value = false
      }
    }
  })
}
</script>
