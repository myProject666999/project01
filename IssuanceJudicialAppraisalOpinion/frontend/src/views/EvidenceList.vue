<template>
  <div class="evidence-list">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="检材名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入检材名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="封存状态">
          <el-select
            v-model="searchForm.sealedStatus"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="未封存" value="UNSEALED" />
            <el-option label="已封存" value="SEALED" />
            <el-option label="已启封" value="OPENED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleReceive">
            <el-icon><Plus /></el-icon>
            接收
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="evidenceNo" label="检材编号" width="180" />
        <el-table-column prop="evidenceName" label="名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="evidenceType" label="类型" width="150" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="weight" label="重量" width="120">
          <template #default="{ row }">
            {{ row.weight ? row.weight + 'g' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="sealStatus" label="封存状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getSealedStatusType(row.sealStatus)">{{ getSealedStatusText(row.sealStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="storageLocation" label="存放位置" width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="info" link @click="handleChain(row)">监管链</el-button>
            <el-button type="success" link @click="handleUploadPhoto(row)">上传照片</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog
      v-model="receiveDialogVisible"
      title="接收检材"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="receiveForm" :rules="receiveRules" ref="receiveFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检材编号" prop="evidenceNo">
              <el-input v-model="receiveForm.evidenceNo" placeholder="自动生成" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联委托" prop="entrustmentId">
              <el-select v-model="receiveForm.entrustmentId" placeholder="请选择委托" style="width: 100%" filterable>
                <el-option
                  v-for="item in entrustmentOptions"
                  :key="item.id"
                  :label="item.caseName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="检材名称" prop="name">
          <el-input v-model="receiveForm.name" placeholder="请输入检材名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检材类型" prop="type">
              <el-select v-model="receiveForm.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="物证" value="物证" />
                <el-option label="书证" value="书证" />
                <el-option label="视听资料" value="视听资料" />
                <el-option label="电子数据" value="电子数据" />
                <el-option label="生物样本" value="生物样本" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="receiveForm.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="重量" prop="weight">
              <el-input v-model="receiveForm.weight" placeholder="请输入重量" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重量单位" prop="weightUnit">
              <el-select v-model="receiveForm.weightUnit" placeholder="请选择单位" style="width: 100%">
                <el-option label="克(g)" value="g" />
                <el-option label="千克(kg)" value="kg" />
                <el-option label="毫克(mg)" value="mg" />
                <el-option label="个" value="个" />
                <el-option label="件" value="件" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="存放位置" prop="storageLocation">
          <el-input v-model="receiveForm.storageLocation" placeholder="请输入存放位置" />
        </el-form-item>
        <el-form-item label="检材描述" prop="description">
          <el-input
            v-model="receiveForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入检材描述"
          />
        </el-form-item>
        <el-form-item label="上传照片">
          <el-upload
            class="photo-uploader"
            :auto-upload="false"
            :on-change="handlePhotoChange"
            :file-list="photoFileList"
            list-type="picture-card"
            accept="image/*"
            :limit="5"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="photo-tip">上传照片时需要记录地理位置</div>
        </el-form-item>
        <el-form-item label="地理位置">
          <el-input
            v-model="receiveForm.location"
            placeholder="请输入地理位置，如：北京市海淀区，或输入'未知'"
          />
          <el-button type="primary" size="small" @click="setUnknownLocation">设为未知</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="receiveDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleReceiveSubmit">确定接收</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewVisible" title="检材详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="检材编号">{{ currentRow.evidenceNo }}</el-descriptions-item>
        <el-descriptions-item label="检材类型">{{ currentRow.evidenceType }}</el-descriptions-item>
        <el-descriptions-item label="名称" :span="2">{{ currentRow.evidenceName }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ currentRow.quantity }}</el-descriptions-item>
        <el-descriptions-item label="重量">
          {{ currentRow.weight ? currentRow.weight + 'g' : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="封存状态">
          <el-tag :type="getSealedStatusType(currentRow.sealStatus)">{{ getSealedStatusText(currentRow.sealStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="存放位置">{{ currentRow.storageLocation }}</el-descriptions-item>
        <el-descriptions-item label="接收日期">{{ currentRow.receiveTime }}</el-descriptions-item>
        <el-descriptions-item label="检材描述" :span="2">{{ currentRow.description }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog
      v-model="uploadPhotoVisible"
      title="上传检材照片"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="uploadPhotoForm" :rules="uploadPhotoRules" ref="uploadPhotoFormRef" label-width="100px">
        <el-form-item label="检材编号">
          <el-input v-model="uploadPhotoForm.evidenceNo" disabled />
        </el-form-item>
        <el-form-item label="照片" prop="photo">
          <el-upload
            class="photo-uploader"
            :auto-upload="false"
            :on-change="handleUploadPhotoChange"
            :file-list="uploadPhotoFileList"
            list-type="picture-card"
            accept="image/*"
            :limit="5"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="地理位置" prop="location">
          <el-input
            v-model="uploadPhotoForm.location"
            placeholder="请输入地理位置，如：北京市海淀区，或输入'未知'"
          />
          <el-button type="primary" size="small" @click="setUploadUnknownLocation">设为未知</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadPhotoVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploadSubmitLoading" @click="handleUploadPhotoSubmit">上传</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { getEvidenceList, createEvidence } from '@/api/evidence'
import { getEntrustmentList } from '@/api/entrustment'
import { uploadEvidencePhoto } from '@/api/attachment'

const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const uploadSubmitLoading = ref(false)
const receiveDialogVisible = ref(false)
const viewVisible = ref(false)
const uploadPhotoVisible = ref(false)
const currentRow = ref({})
const receiveFormRef = ref(null)
const uploadPhotoFormRef = ref(null)

const searchForm = reactive({
  name: '',
  sealedStatus: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])
const entrustmentOptions = ref([])
const photoFileList = ref([])
const uploadPhotoFileList = ref([])

const receiveForm = reactive({
  evidenceNo: '',
  entrustmentId: null,
  name: '',
  type: '',
  quantity: 1,
  weight: '',
  weightUnit: 'g',
  storageLocation: '',
  description: '',
  location: '',
  sealedStatus: 'SEALED'
})

const uploadPhotoForm = reactive({
  evidenceId: null,
  evidenceNo: '',
  location: ''
})

const receiveRules = {
  name: [{ required: true, message: '请输入检材名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择检材类型', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }]
}

const uploadPhotoRules = {
  location: [{ required: true, message: '请输入地理位置', trigger: 'blur' }]
}

const sealedStatusMap = {
  UNSEALED: { text: '未封存', type: 'info' },
  SEALED: { text: '已封存', type: 'success' },
  OPENED: { text: '已启封', type: 'warning' }
}

const getSealedStatusText = (status) => sealedStatusMap[status]?.text || status
const getSealedStatusType = (status) => sealedStatusMap[status]?.type || 'info'

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getEvidenceList(searchForm)
    if (res.code === 200) {
      const list = Array.isArray(res.data) ? res.data : (res.data?.list || [])
      tableData.value = list
      pagination.total = list.length
    }
  } catch (error) {
    console.error('获取列表失败', error)
  } finally {
    loading.value = false
  }
}

const fetchEntrustmentOptions = async () => {
  try {
    const res = await getEntrustmentList()
    if (res.code === 200) {
      entrustmentOptions.value = Array.isArray(res.data) ? res.data : (res.data?.list || [])
    }
  } catch (error) {
    console.error('获取委托列表失败', error)
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchList()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.sealedStatus = ''
  handleSearch()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  fetchList()
}

const handleCurrentChange = (page) => {
  pagination.pageNum = page
  fetchList()
}

const resetReceiveForm = () => {
  receiveForm.evidenceNo = ''
  receiveForm.entrustmentId = null
  receiveForm.name = ''
  receiveForm.type = ''
  receiveForm.quantity = 1
  receiveForm.weight = ''
  receiveForm.weightUnit = 'g'
  receiveForm.storageLocation = ''
  receiveForm.description = ''
  receiveForm.location = ''
  receiveForm.sealedStatus = 'SEALED'
  photoFileList.value = []
  if (receiveFormRef.value) {
    receiveFormRef.value.resetFields()
  }
}

const handleReceive = () => {
  resetReceiveForm()
  fetchEntrustmentOptions()
  receiveDialogVisible.value = true
}

const handleView = (row) => {
  currentRow.value = row
  viewVisible.value = true
}

const handleChain = (row) => {
  router.push('/evidence-chain')
}

const handlePhotoChange = (file, fileList) => {
  photoFileList.value = fileList
}

const handleUploadPhotoChange = (file, fileList) => {
  uploadPhotoFileList.value = fileList
}

const setUnknownLocation = () => {
  receiveForm.location = '未知'
}

const setUploadUnknownLocation = () => {
  uploadPhotoForm.location = '未知'
}

const handleReceiveSubmit = async () => {
  if (!receiveFormRef.value) return
  try {
    await receiveFormRef.value.validate()
    submitLoading.value = true
    const res = await createEvidence(receiveForm)
    if (res.code === 200) {
      const evidenceId = res.data?.id || res.data
      if (photoFileList.value.length > 0 && evidenceId) {
        for (const fileItem of photoFileList.value) {
          await uploadEvidencePhoto(fileItem.raw, evidenceId, receiveForm.location || '未知')
        }
      }
      ElMessage.success('接收成功')
      receiveDialogVisible.value = false
      fetchList()
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

const handleUploadPhoto = (row) => {
  uploadPhotoForm.evidenceId = row.id
  uploadPhotoForm.evidenceNo = row.evidenceNo
  uploadPhotoForm.location = ''
  uploadPhotoFileList.value = []
  uploadPhotoVisible.value = true
}

const handleUploadPhotoSubmit = async () => {
  if (!uploadPhotoFormRef.value) return
  try {
    await uploadPhotoFormRef.value.validate()
    if (uploadPhotoFileList.value.length === 0) {
      ElMessage.warning('请选择要上传的照片')
      return
    }
    uploadSubmitLoading.value = true
    for (const fileItem of uploadPhotoFileList.value) {
      await uploadEvidencePhoto(fileItem.raw, uploadPhotoForm.evidenceId, uploadPhotoForm.location || '未知')
    }
    ElMessage.success('上传成功')
    uploadPhotoVisible.value = false
  } catch (error) {
    if (error !== false) {
      ElMessage.error(error.message || '上传失败')
    }
  } finally {
    uploadSubmitLoading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.evidence-list {
  padding: 0;
}

.search-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.photo-uploader {
  margin-bottom: 10px;
}

.photo-tip {
  font-size: 12px;
  color: #909399;
}
</style>
