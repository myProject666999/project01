<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">派送任务</h1>
      <div>
        <el-select v-model="filterStatus" @change="loadData" placeholder="筛选状态" clearable style="margin-right: 10px; width: 150px;">
          <el-option label="待接单" :value="1" />
          <el-option label="已接单" :value="2" />
          <el-option label="派送中" :value="3" />
          <el-option label="已签收" :value="4" />
          <el-option label="异常" :value="5" />
        </el-select>
      </div>
    </div>

    <div class="table-container">
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="task_no" label="任务号" />
        <el-table-column label="收件人">
          <template #default="{ row }">
            {{ row.customer?.name }}
          </template>
        </el-table-column>
        <el-table-column label="收件地址">
          <template #default="{ row }">
            {{ row.customer?.address }}
          </template>
        </el-table-column>
        <el-table-column label="派送员">
          <template #default="{ row }">
            {{ row.courier?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="路线">
          <template #default="{ row }">
            {{ row.route?.route_no || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="sequence" label="派送顺序" width="100" />
        <el-table-column label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="signed_by" label="签收人" />
        <el-table-column prop="delivered_at" label="签收时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button v-if="row.status === 1" type="primary" link @click="acceptTask(row)">
              接单
            </el-button>
            <el-button v-if="row.status === 2 || row.status === 3" type="primary" link @click="completeDialog(row)">
              签收
            </el-button>
            <el-button v-if="row.status !== 4" type="danger" link @click="exceptionDialog(row)">
              异常
            </el-button>
            <el-button type="info" link @click="viewProof(row)">
              凭证
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <el-dialog v-model="showCompleteDialog" title="签收确认" width="600px">
      <el-form :model="completeForm" label-width="100px">
        <el-form-item label="签收人">
          <el-input v-model="completeForm.signed_by" />
        </el-form-item>
        <el-form-item label="签收时间">
          <el-date-picker v-model="completeForm.delivered_at" type="datetime" />
        </el-form-item>
        <el-form-item label="签收位置">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-input v-model="completeForm.latitude" placeholder="纬度" />
            </el-col>
            <el-col :span="12">
              <el-input v-model="completeForm.longitude" placeholder="经度" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="签收照片">
          <el-upload
            :action="uploadUrl"
            :headers="{ 'Authorization': 'Bearer 123' }"
            :on-success="handleUploadSuccess"
            list-type="picture"
            accept="image/*"
          >
            <el-button type="primary" size="small">选择照片</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="签名">
          <div style="border: 1px solid #dcdfe6; width: 400px; height: 150px; background: #f5f7fa; cursor: crosshair;" ref="signaturePad" @mousedown="startDraw" @mousemove="draw" @mouseup="stopDraw" @mouseleave="stopDraw">
            <span v-if="!hasSignature" style="color: #999; line-height: 150px; text-align: center; display: block;">请在此签名</span>
          </div>
          <el-button size="small" @click="clearSignature" style="margin-top: 5px;">清除签名</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCompleteDialog = false">取消</el-button>
        <el-button type="primary" @click="submitComplete">确认签收</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showExceptionDialog" title="上报异常" width="500px">
      <el-form :model="exceptionForm" label-width="100px">
        <el-form-item label="异常类型">
          <el-radio-group v-model="exceptionForm.exception_type">
            <el-radio value="reject">拒收</el-radio>
            <el-radio value="no_one">无人在家</el-radio>
            <el-radio value="wrong_address">地址错误</el-radio>
            <el-radio value="damaged">破损</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="exceptionForm.description" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showExceptionDialog = false">取消</el-button>
        <el-button type="danger" @click="submitException">上报</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showProofDialog" title="签收凭证" width="800px">
      <div v-if="currentProof">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="签收人">{{ currentProof.signed_by }}</el-descriptions-item>
          <el-descriptions-item label="签收时间">{{ currentProof.delivered_at }}</el-descriptions-item>
          <el-descriptions-item label="位置" :span="2">
            {{ currentProof.latitude }}, {{ currentProof.longitude }}
          </el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 20px; display: flex; gap: 20px;">
          <div>
            <h4>签收照片</h4>
            <img v-if="currentProof.photo_url" :src="currentProof.photo_url" style="max-width: 300px; border-radius: 8px;" />
            <p v-else style="color: #999;">无照片</p>
          </div>
          <div>
            <h4>签名</h4>
            <img v-if="currentProof.signature_url" :src="currentProof.signature_url" style="max-width: 300px; border-radius: 8px;" />
            <p v-else style="color: #999;">无签名</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { taskAPI, uploadAPI } from '../api'

const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const filterStatus = ref(null)

const showCompleteDialog = ref(false)
const showExceptionDialog = ref(false)
const showProofDialog = ref(false)
const currentTaskId = ref(null)
const currentProof = ref(null)

const uploadUrl = '/api/v1/upload/photo'

const completeForm = ref({
  signed_by: '',
  delivered_at: new Date(),
  latitude: '',
  longitude: '',
  photo_url: '',
  signature_url: ''
})

const exceptionForm = ref({
  exception_type: '',
  description: ''
})

const signaturePad = ref(null)
const isDrawing = ref(false)
const hasSignature = ref(false)
let ctx = null
let lastX = 0
let lastY = 0

const getStatusType = (status) => {
  const types = ['', 'info', 'warning', 'primary', 'success', 'danger']
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = ['', '待接单', '已接单', '派送中', '已签收', '异常']
  return texts[status] || '未知'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await taskAPI.list({
      page: page.value, page_size: pageSize.value, status: filterStatus.value || 0
    })
    list.value = res.data?.list || []
    total.value = res.data?.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const acceptTask = async (row) => {
  try {
    await ElMessageBox.confirm('确定接单吗？', '提示', { type: 'warning' })
    await taskAPI.accept(row.id, { courier_id: 1 })
    ElMessage.success('接单成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

const completeDialog = async (row) => {
  currentTaskId.value = row.id
  completeForm.value = {
    signed_by: '',
    delivered_at: new Date(),
    latitude: '34.0522',
    longitude: '-118.2437',
    photo_url: '',
    signature_url: ''
  }
  hasSignature.value = false
  showCompleteDialog.value = true
  await nextTick()
  initSignaturePad()
}

const initSignaturePad = () => {
  if (!signaturePad.value) return
  ctx = signaturePad.value.getContext('2d')
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

const startDraw = (e) => {
  isDrawing.value = true
  hasSignature.value = true
  const rect = signaturePad.value.getBoundingClientRect()
  lastX = e.clientX - rect.left
  lastY = e.clientY - rect.top
}

const draw = (e) => {
  if (!isDrawing.value) return
  const rect = signaturePad.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x
  lastY = y
}

const stopDraw = () => {
  isDrawing.value = false
}

const clearSignature = () => {
  if (ctx && signaturePad.value) {
    ctx.clearRect(0, 0, signaturePad.value.width, signaturePad.value.height)
    hasSignature.value = false
  }
}

const handleUploadSuccess = (res) => {
  if (res.code === 200) {
    completeForm.value.photo_url = res.data.url
    ElMessage.success('照片上传成功')
  } else {
    ElMessage.error(res.message || '上传失败')
  }
}

const submitComplete = async () => {
  if (!completeForm.value.signed_by) {
    ElMessage.warning('请填写签收人')
    return
  }

  if (hasSignature.value) {
    const signatureData = signaturePad.value.toDataURL('image/png')
    try {
      const res = await uploadAPI.uploadSignature(signatureData)
      completeForm.value.signature_url = res.data.url
    } catch (e) {
      console.error(e)
    }
  }

  try {
    await taskAPI.complete(currentTaskId.value, completeForm.value)
    ElMessage.success('签收成功')
    showCompleteDialog.value = false
    loadData()
  } catch (e) {
    console.error(e)
  }
}

const exceptionDialog = (row) => {
  currentTaskId.value = row.id
  exceptionForm.value = { exception_type: '', description: '' }
  showExceptionDialog.value = true
}

const submitException = async () => {
  if (!exceptionForm.value.exception_type) {
    ElMessage.warning('请选择异常类型')
    return
  }
  try {
    await taskAPI.reportException(currentTaskId.value, {
      reported_by: 1,
      ...exceptionForm.value
    })
    ElMessage.success('异常已上报')
    showExceptionDialog.value = false
    loadData()
  } catch (e) {
    console.error(e)
  }
}

const viewProof = async (row) => {
  try {
    const taskRes = await taskAPI.get(row.id)
    const task = taskRes.data
    let proof = null
    try {
      const proofRes = await taskAPI.getProof(row.id)
      proof = proofRes.data
    } catch (e) {
      // no proof yet
    }
    currentProof.value = {
      signed_by: task.signed_by || (proof ? proof.signer_name : ''),
      delivered_at: task.delivered_at || task.actual_delivery_time || '',
      latitude: proof ? proof.latitude : '',
      longitude: proof ? proof.longitude : '',
      photo_url: proof ? proof.photo_url : '',
      signature_url: proof ? proof.signature_url : ''
    }
    showProofDialog.value = true
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
