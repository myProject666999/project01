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
          <el-form-item label="地块" prop="plotId">
            <el-select v-model="formData.plotId" placeholder="请选择地块" style="width: 100%">
              <el-option label="东北人参种植基地A区" value="P2024001" />
              <el-option label="云南三七种植基地" value="P2024002" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作类型" prop="operationType">
            <el-select v-model="formData.operationType" placeholder="请选择操作类型" style="width: 100%">
              <el-option label="播种" value="1" />
              <el-option label="施肥" value="2" />
              <el-option label="浇水" value="3" />
              <el-option label="除草" value="4" />
              <el-option label="打农药" value="5" />
              <el-option label="修剪" value="6" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作日期" prop="operationDate">
            <el-date-picker
              v-model="formData.operationDate"
              type="date"
              placeholder="请选择操作日期"
              value-format="YYYY-MM-DD"
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
          <el-form-item label="天气" prop="weather">
            <el-select v-model="formData.weather" placeholder="请选择天气" style="width: 100%">
              <el-option label="晴" value="晴" />
              <el-option label="多云" value="多云" />
              <el-option label="阴" value="阴" />
              <el-option label="小雨" value="小雨" />
              <el-option label="中雨" value="中雨" />
              <el-option label="大雨" value="大雨" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="肥料">
            <el-select v-model="formData.fertilizerId" placeholder="请选择肥料（可选）" clearable style="width: 100%">
              <el-option label="有机肥" value="F001" />
              <el-option label="复合肥" value="F002" />
              <el-option label="尿素" value="F003" />
              <el-option label="过磷酸钙" value="F004" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="肥料用量">
            <el-input v-model="formData.fertilizerDosage" placeholder="请输入肥料用量" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="农药">
            <el-select v-model="formData.pesticideId" placeholder="请选择农药（可选）" clearable style="width: 100%">
              <el-option label="多菌灵" value="P001" />
              <el-option label="百菌清" value="P002" />
              <el-option label="敌敌畏" value="P003" />
              <el-option label="乐果" value="P004" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="农药用量">
            <el-input v-model="formData.pesticideDosage" placeholder="请输入农药用量" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="操作详情" prop="operationDetail">
            <el-input v-model="formData.operationDetail" type="textarea" :rows="4" placeholder="请输入操作详情" />
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
  const titleMap = { add: '新增农事记录', edit: '编辑农事记录', view: '农事记录详情' }
  return titleMap[props.mode] || '农事记录'
})

const defaultFormData = () => ({
  plotId: '',
  plotName: '',
  operationType: '',
  operationDate: '',
  operator: '',
  weather: '',
  fertilizerId: '',
  fertilizerName: '',
  fertilizerDosage: '',
  pesticideId: '',
  pesticideName: '',
  pesticideDosage: '',
  operationDetail: ''
})

const formData = ref(defaultFormData())

const rules = {
  plotId: [{ required: true, message: '请选择地块', trigger: 'change' }],
  operationType: [{ required: true, message: '请选择操作类型', trigger: 'change' }],
  operationDate: [{ required: true, message: '请选择操作日期', trigger: 'change' }],
  operator: [{ required: true, message: '请输入操作人', trigger: 'blur' }],
  operationDetail: [{ required: true, message: '请输入操作详情', trigger: 'blur' }]
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
