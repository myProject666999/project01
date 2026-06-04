<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="800px"
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
        <el-col :span="12">
          <el-form-item label="名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入地块名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="省份" prop="province">
            <el-select v-model="formData.province" placeholder="请选择省份" style="width: 100%">
              <el-option label="北京市" value="北京市" />
              <el-option label="上海市" value="上海市" />
              <el-option label="广东省" value="广东省" />
              <el-option label="浙江省" value="浙江省" />
              <el-option label="江苏省" value="江苏省" />
              <el-option label="吉林省" value="吉林省" />
              <el-option label="云南省" value="云南省" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="城市" prop="city">
            <el-input v-model="formData.city" placeholder="请输入城市" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="区县" prop="district">
            <el-input v-model="formData.district" placeholder="请输入区县" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="详细地址" prop="address">
            <el-input v-model="formData.address" placeholder="请输入详细地址" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="经度" prop="longitude">
            <el-input v-model="formData.longitude" placeholder="请输入经度" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="纬度" prop="latitude">
            <el-input v-model="formData.latitude" placeholder="请输入纬度" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="海拔(m)" prop="altitude">
            <el-input-number v-model="formData.altitude" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="土壤类型" prop="soilType">
            <el-select v-model="formData.soilType" placeholder="请选择土壤类型" style="width: 100%">
              <el-option label="黑土" value="黑土" />
              <el-option label="红壤" value="红壤" />
              <el-option label="黄土" value="黄土" />
              <el-option label="褐土" value="褐土" />
              <el-option label="潮土" value="潮土" />
              <el-option label="水稻土" value="水稻土" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="土壤pH值" prop="soilPh">
            <el-input-number v-model="formData.soilPh" :min="0" :max="14" :step="0.1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="面积(亩)" prop="area">
            <el-input-number v-model="formData.area" :min="0" :step="0.01" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="种苗来源" prop="seedlingSource">
            <el-input v-model="formData.seedlingSource" placeholder="请输入种苗来源" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="种植品种" prop="variety">
            <el-select v-model="formData.variety" placeholder="请选择种植品种" style="width: 100%">
              <el-option label="人参" value="人参" />
              <el-option label="当归" value="当归" />
              <el-option label="黄芪" value="黄芪" />
              <el-option label="枸杞" value="枸杞" />
              <el-option label="金银花" value="金银花" />
              <el-option label="三七" value="三七" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="种植日期" prop="plantDate">
            <el-date-picker
              v-model="formData.plantDate"
              type="date"
              placeholder="请选择种植日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预计采收日期" prop="expectedHarvestDate">
            <el-date-picker
              v-model="formData.expectedHarvestDate"
              type="date"
              placeholder="请选择预计采收日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人" prop="manager">
            <el-input v-model="formData.manager" placeholder="请输入负责人" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
  const titleMap = { add: '新增地块', edit: '编辑地块', view: '地块详情' }
  return titleMap[props.mode] || '地块信息'
})

const defaultFormData = () => ({
  name: '',
  province: '',
  city: '',
  district: '',
  address: '',
  longitude: '',
  latitude: '',
  altitude: null,
  soilType: '',
  soilPh: null,
  area: null,
  seedlingSource: '',
  variety: '',
  plantDate: '',
  expectedHarvestDate: '',
  manager: '',
  remark: ''
})

const formData = ref(defaultFormData())

const rules = {
  name: [{ required: true, message: '请输入地块名称', trigger: 'blur' }],
  province: [{ required: true, message: '请选择省份', trigger: 'change' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  longitude: [{ required: true, message: '请输入经度', trigger: 'blur' }],
  latitude: [{ required: true, message: '请输入纬度', trigger: 'blur' }],
  area: [{ required: true, message: '请输入面积', trigger: 'blur' }],
  variety: [{ required: true, message: '请选择种植品种', trigger: 'change' }],
  plantDate: [{ required: true, message: '请选择种植日期', trigger: 'change' }],
  manager: [{ required: true, message: '请输入负责人', trigger: 'blur' }]
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
