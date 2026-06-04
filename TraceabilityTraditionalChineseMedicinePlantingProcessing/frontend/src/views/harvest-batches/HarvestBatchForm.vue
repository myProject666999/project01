<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
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
          <el-form-item label="地块" prop="plotId">
            <el-select v-model="formData.plotId" placeholder="请选择地块" style="width: 100%">
              <el-option label="东北人参种植基地A区" value="P2024001" />
              <el-option label="云南三七种植基地" value="P2024002" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="采收日期" prop="harvestDate">
            <el-date-picker
              v-model="formData.harvestDate"
              type="date"
              placeholder="请选择采收日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="采收量(kg)" prop="harvestQuantity">
            <el-input-number v-model="formData.harvestQuantity" :min="0" :step="0.01" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="质量等级" prop="qualityGrade">
            <el-select v-model="formData.qualityGrade" placeholder="请选择质量等级" style="width: 100%">
              <el-option label="一级" value="一级" />
              <el-option label="二级" value="二级" />
              <el-option label="三级" value="三级" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="采收方式" prop="harvestMethod">
            <el-select v-model="formData.harvestMethod" placeholder="请选择采收方式" style="width: 100%">
              <el-option label="人工采收" value="人工采收" />
              <el-option label="机械采收" value="机械采收" />
              <el-option label="半机械采收" value="半机械采收" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="天气" prop="weather">
            <el-select v-model="formData.weather" placeholder="请选择天气" style="width: 100%">
              <el-option label="晴" value="晴" />
              <el-option label="多云" value="多云" />
              <el-option label="阴" value="阴" />
              <el-option label="小雨" value="小雨" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="采收负责人" prop="manager">
            <el-input v-model="formData.manager" placeholder="请输入采收负责人" />
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
  const titleMap = { add: '新增采收批次', edit: '编辑采收批次', view: '采收批次详情' }
  return titleMap[props.mode] || '采收批次'
})

const defaultFormData = () => ({
  plotId: '',
  plotName: '',
  harvestDate: '',
  harvestQuantity: null,
  qualityGrade: '',
  harvestMethod: '',
  weather: '',
  manager: ''
})

const formData = ref(defaultFormData())

const rules = {
  plotId: [{ required: true, message: '请选择地块', trigger: 'change' }],
  harvestDate: [{ required: true, message: '请选择采收日期', trigger: 'change' }],
  harvestQuantity: [{ required: true, message: '请输入采收量', trigger: 'blur' }],
  qualityGrade: [{ required: true, message: '请选择质量等级', trigger: 'change' }],
  harvestMethod: [{ required: true, message: '请选择采收方式', trigger: 'change' }],
  manager: [{ required: true, message: '请输入采收负责人', trigger: 'blur' }]
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
