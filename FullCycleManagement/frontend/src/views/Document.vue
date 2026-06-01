<template>
  <div class="document-page">
    <el-card>
      <template #header>
        <span>文书生成</span>
      </template>

      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="选择案件" prop="caseId">
          <el-select v-model="form.caseId" placeholder="请选择案件" style="width: 100%">
            <el-option
              v-for="c in cases"
              :key="c.id"
              :label="`${c.caseNumber} - ${c.caseName}`"
              :value="c.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="文书模板" prop="templateCode">
          <el-select v-model="form.templateCode" placeholder="请选择文书模板" style="width: 100%">
            <el-option
              v-for="t in templates"
              :key="t.templateCode"
              :label="t.templateName"
              :value="t.templateCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="文书名称" prop="docName">
          <el-input v-model="form.docName" placeholder="请输入文书名称" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="generateDocument" :loading="generating">
            <el-icon><Download /></el-icon>
            生成并下载
          </el-button>
          <el-button @click="saveDocument" :loading="saving">
            <el-icon><DocumentAdd /></el-icon>
            保存到案件
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>已生成文书记录</span>
      </template>
      <el-table :data="documents" border v-if="form.caseId">
        <el-table-column prop="docName" label="文书名称" />
        <el-table-column prop="docType" label="文书类型" />
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="请先选择案件" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { caseApi, documentApi } from '../api'

const formRef = ref()
const cases = ref([])
const templates = ref([])
const documents = ref([])
const generating = ref(false)
const saving = ref(false)

const form = ref({
  caseId: null,
  templateCode: '',
  docName: ''
})

const rules = {
  caseId: [{ required: true, message: '请选择案件', trigger: 'change' }],
  templateCode: [{ required: true, message: '请选择文书模板', trigger: 'change' }],
  docName: [{ required: true, message: '请输入文书名称', trigger: 'blur' }]
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const loadCases = async () => {
  try {
    cases.value = await caseApi.getAll()
  } catch (error) {
    console.error('加载案件列表失败:', error)
  }
}

const loadTemplates = async () => {
  try {
    templates.value = await documentApi.getTemplates()
  } catch (error) {
    console.error('加载模板列表失败:', error)
  }
}

const loadDocuments = async () => {
  if (!form.value.caseId) return
  try {
    documents.value = await documentApi.getByCaseId(form.value.caseId)
  } catch (error) {
    console.error('加载文书记录失败:', error)
  }
}

const generateDocument = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    generating.value = true
    try {
      const response = await documentApi.generate(form.value.caseId, form.value.templateCode)
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = form.value.docName + '.docx'
      link.click()
      window.URL.revokeObjectURL(url)
      ElMessage.success('文书生成成功')
    } catch (error) {
      ElMessage.error('文书生成失败')
    } finally {
      generating.value = false
    }
  })
}

const saveDocument = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      await documentApi.save(form.value.caseId, form.value.templateCode, form.value.docName)
      ElMessage.success('文书保存成功')
      loadDocuments()
    } catch (error) {
      ElMessage.error('文书保存失败')
    } finally {
      saving.value = false
    }
  })
}

watch(() => form.value.caseId, () => {
  loadDocuments()
})

onMounted(() => {
  loadCases()
  loadTemplates()
})
</script>

<style scoped>
.document-page {
  padding: 0;
}
</style>
