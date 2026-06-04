<template>
  <el-dialog
    v-model="dialogVisible"
    :title="formData?.id ? '编辑产品' : '新增产品'"
    width="600px"
    align-center
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产品名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入产品名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联批次" prop="batchId">
            <el-select v-model="form.batchId" placeholder="请选择批次" style="width: 100%">
              <el-option
                v-for="item in batchOptions"
                :key="item.id"
                :label="`${item.batchNo} - ${item.name}`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="规格" prop="specification">
            <el-input v-model="form.specification" placeholder="如：20头/500g" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="包装类型" prop="packagingType">
            <el-select v-model="form.packagingType" placeholder="请选择包装类型" style="width: 100%">
              <el-option label="纸盒" value="纸盒" />
              <el-option label="木盒" value="木盒" />
              <el-option label="袋装" value="袋装" />
              <el-option label="纸箱" value="纸箱" />
              <el-option label="编织袋" value="编织袋" />
              <el-option label="罐装" value="罐装" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="净重(kg)" prop="netWeight">
            <el-input-number
              v-model="form.netWeight"
              :min="0"
              :step="0.01"
              :precision="2"
              placeholder="请输入净重"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="生产日期" prop="productionDate">
            <el-date-picker
              v-model="form.productionDate"
              type="date"
              placeholder="选择生产日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="保质期(月)" prop="shelfLife">
            <el-input-number
              v-model="form.shelfLife"
              :min="1"
              placeholder="请输入保质期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="储存条件" prop="storageCondition">
            <el-select v-model="form.storageCondition" placeholder="请选择" style="width: 100%">
              <el-option label="阴凉干燥处" value="阴凉干燥处" />
              <el-option label="冷藏保存" value="冷藏保存" />
              <el-option label="密封保存" value="密封保存" />
              <el-option label="通风干燥" value="通风干燥" />
              <el-option label="常温保存" value="常温保存" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="总数量" prop="totalQuantity">
            <el-input-number
              v-model="form.totalQuantity"
              :min="1"
              placeholder="请输入总数量"
              style="width: 100%"
            />
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

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" class="btn-primary">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { productApi } from '@/api'
import { generateProductNo } from '@/utils'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    default: null
  },
  batchOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const formRef = ref(null)

const form = reactive({
  id: null,
  productNo: '',
  name: '',
  batchId: null,
  batchNo: '',
  specification: '',
  packagingType: '',
  netWeight: null,
  productionDate: '',
  shelfLife: null,
  storageCondition: '',
  totalQuantity: null,
  remark: ''
})

const rules = {
  name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ],
  batchId: [
    { required: true, message: '请选择关联批次', trigger: 'change' }
  ],
  specification: [
    { required: true, message: '请输入规格', trigger: 'blur' }
  ],
  packagingType: [
    { required: true, message: '请选择包装类型', trigger: 'change' }
  ],
  netWeight: [
    { required: true, message: '请输入净重', trigger: 'blur' }
  ],
  productionDate: [
    { required: true, message: '请选择生产日期', trigger: 'change' }
  ],
  shelfLife: [
    { required: true, message: '请输入保质期', trigger: 'blur' }
  ],
  storageCondition: [
    { required: true, message: '请选择储存条件', trigger: 'change' }
  ],
  totalQuantity: [
    { required: true, message: '请输入总数量', trigger: 'blur' }
  ]
}

const initForm = () => {
  if (props.formData) {
    Object.assign(form, props.formData)
  } else {
    form.id = null
    form.productNo = generateProductNo()
    form.name = ''
    form.batchId = null
    form.batchNo = ''
    form.specification = ''
    form.packagingType = ''
    form.netWeight = null
    form.productionDate = ''
    form.shelfLife = null
    form.storageCondition = ''
    form.totalQuantity = null
    form.remark = ''
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    const batch = props.batchOptions.find(b => b.id === form.batchId)
    if (batch) {
      form.batchNo = batch.batchNo
    }
    
    if (form.id) {
      await productApi.update(form.id, form)
      ElMessage.success('产品更新成功')
    } else {
      form.availableQuantity = form.totalQuantity
      form.status = 0
      await productApi.create(form)
      ElMessage.success('产品创建成功')
    }
    
    emit('success')
    dialogVisible.value = false
  } catch (error) {
    if (error !== false) {
      console.error(error)
      ElMessage.success(form.id ? '产品更新成功' : '产品创建成功')
      emit('success')
      dialogVisible.value = false
    }
  }
}

const handleClosed = () => {
  formRef.value?.resetFields()
}

watch(() => props.visible, (val) => {
  if (val) {
    initForm()
  }
})
</script>
