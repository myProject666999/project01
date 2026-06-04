<template>
  <div class="page-container">
    <div class="page-header">
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2 class="page-title">藏品详情</h2>
    </div>

    <el-card v-loading="loading">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="藏品编号">{{ collection.collection_no }}</el-descriptions-item>
        <el-descriptions-item label="名称">{{ collection.name }}</el-descriptions-item>
        <el-descriptions-item label="年代">{{ collection.era }}</el-descriptions-item>
        <el-descriptions-item label="来源">{{ collection.source }}</el-descriptions-item>
        <el-descriptions-item label="材质">{{ collection.material }}</el-descriptions-item>
        <el-descriptions-item label="文物级别">
          <el-tag :type="getLevelTagType(collection.level)">{{ collection.level }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="价值评估">{{ collection.value_assessment }}</el-descriptions-item>
        <el-descriptions-item label="当前位置">{{ collection.current_location }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(collection.status)">{{ collection.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="尺寸">{{ collection.dimensions }}</el-descriptions-item>
        <el-descriptions-item label="重量">{{ collection.weight }} kg</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(collection.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="详细描述" :span="2">{{ collection.description }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">藏品照片</el-divider>
      <div class="photo-grid">
        <div v-for="photo in collection.photos" :key="photo.id" class="photo-item">
          <img :src="photo.signed_url" :alt="photo.angle" />
          <div class="photo-info">
            <span>{{ photo.angle }}</span>
            <el-tag v-if="photo.is_primary" type="success" size="small">主图</el-tag>
          </div>
        </div>
        <el-upload
          class="upload-photo"
          :action="uploadAction"
          :headers="uploadHeaders"
          :data="{ collection_id: collection.id, angle: '正面', is_primary: collection.photos?.length === 0 }"
          :on-success="handlePhotoUploadSuccess"
          list-type="picture-card"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </div>

      <el-divider content-position="left">三维模型</el-divider>
      <div class="model-list">
        <div v-for="model in collection.models_3d" :key="model.id" class="model-item">
          <el-icon><Box /></el-icon>
          <span>{{ model.file_name }}</span>
          <el-button type="primary" link size="small" @click="downloadModel(model)">下载</el-button>
        </div>
        <el-upload
          :action="uploadModelAction"
          :headers="uploadHeaders"
          :data="{ collection_id: collection.id }"
          :on-success="handleModelUploadSuccess"
          class="upload-model"
        >
          <el-button type="primary">
            <el-icon><Upload /></el-icon>
            上传三维模型
          </el-button>
        </el-upload>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getCollection, uploadPhoto, upload3DModel } from '@/api'

const route = useRoute()
const loading = ref(false)
const collection = ref({})

const uploadAction = '/api/photos'
const uploadModelAction = '/api/3d-models'
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
}

const getLevelTagType = (level) => {
  const types = {
    '一级': 'danger',
    '二级': 'warning',
    '三级': 'success',
    '一般': 'info'
  }
  return types[level] || 'info'
}

const getStatusTagType = (status) => {
  const types = {
    '在库': 'success',
    '展出': 'warning',
    '外借': 'info',
    '修复中': 'danger',
    '待查': 'danger'
  }
  return types[status] || 'info'
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const loadData = async () => {
  loading.value = true
  try {
    collection.value = await getCollection(route.params.id)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handlePhotoUploadSuccess = (res) => {
  ElMessage.success('照片上传成功')
  loadData()
}

const handleModelUploadSuccess = (res) => {
  ElMessage.success('三维模型上传成功')
  loadData()
}

const downloadModel = (model) => {
  window.open(model.signed_url)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.photo-item {
  width: 150px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
}

.photo-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.photo-info {
  padding: 8px;
  text-align: center;
  font-size: 12px;
}

.photo-info .el-tag {
  margin-top: 4px;
}

.upload-photo {
  width: 150px;
  height: 150px;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.model-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.model-item .el-icon {
  margin-right: 10px;
  font-size: 20px;
  color: #409eff;
}

.model-item span {
  flex: 1;
}
</style>
