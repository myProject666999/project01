import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Photo, PhotoComment, RetouchTask, RetouchVersion, PaginatedResponse } from '@/types'
import { PhotoRating, PhotoStatus, RetouchTaskStatus } from '@/types'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

export const usePhotoStore = defineStore('photo', () => {
  const photos = ref<Photo[]>([])
  const currentPhoto = ref<Photo | null>(null)
  const comments = ref<PhotoComment[]>([])
  const retouchTasks = ref<RetouchTask[]>([])
  const retouchVersions = ref<RetouchVersion[]>([])
  const loading = ref(false)
  const total = ref(0)

  const selectedPhotos = computed(() => photos.value.filter(p => p.isSelected))
  const mustSelectPhotos = computed(() => photos.value.filter(p => p.rating === PhotoRating.MUST_SELECT))
  const alternativePhotos = computed(() => photos.value.filter(p => p.rating === PhotoRating.ALTERNATIVE))
  const rejectedPhotos = computed(() => photos.value.filter(p => p.rating === PhotoRating.REJECTED))

  const fetchPhotos = async (orderId: number, params?: { page?: number; pageSize?: number; status?: string; rating?: number }) => {
    loading.value = true
    try {
      const response = await request.get<PaginatedResponse<Photo>>(`/orders/${orderId}/photos`, { params })
      photos.value = response.items
      total.value = response.total
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '获取照片列表失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchPhotoById = async (photoId: number) => {
    loading.value = true
    try {
      const response = await request.get<Photo>(`/photos/${photoId}`)
      currentPhoto.value = response
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '获取照片详情失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  const ratePhoto = async (photoId: number, rating: PhotoRating) => {
    try {
      const response = await request.patch<Photo>(`/photos/${photoId}/rate`, { rating })
      const photo = photos.value.find(p => p.id === photoId)
      if (photo) {
        photo.rating = rating
        photo.isSelected = rating !== PhotoRating.REJECTED
      }
      if (currentPhoto.value?.id === photoId) {
        currentPhoto.value.rating = rating
        currentPhoto.value.isSelected = rating !== PhotoRating.REJECTED
      }
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '评分失败')
      throw error
    }
  }

  const togglePhotoSelection = async (photoId: number) => {
    const photo = photos.value.find(p => p.id === photoId)
    if (!photo) return

    const newSelected = !photo.isSelected
    try {
      const response = await request.patch<Photo>(`/photos/${photoId}`, { isSelected: newSelected })
      photo.isSelected = newSelected
      if (currentPhoto.value?.id === photoId) {
        currentPhoto.value.isSelected = newSelected
      }
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '操作失败')
      throw error
    }
  }

  const fetchComments = async (photoId: number) => {
    try {
      const response = await request.get<PhotoComment[]>(`/photos/${photoId}/comments`)
      comments.value = response
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '获取评论失败')
      throw error
    }
  }

  const addComment = async (photoId: number, content: string) => {
    try {
      const response = await request.post<PhotoComment>(`/photos/${photoId}/comments`, { content })
      comments.value.push(response)
      ElMessage.success('评论已发送')
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '评论失败')
      throw error
    }
  }

  const fetchRetouchTasks = async (params?: { status?: RetouchTaskStatus; page?: number; pageSize?: number }) => {
    loading.value = true
    try {
      const response = await request.get<PaginatedResponse<RetouchTask>>('/retouch/tasks', { params })
      retouchTasks.value = response.items
      total.value = response.total
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '获取修图任务失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  const claimTask = async (taskId: number) => {
    try {
      const response = await request.post<RetouchTask>(`/retouch/tasks/${taskId}/claim`)
      const task = retouchTasks.value.find(t => t.id === taskId)
      if (task) {
        Object.assign(task, response)
      }
      ElMessage.success('任务已领取')
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '领取失败')
      throw error
    }
  }

  const submitRetouch = async (taskId: number, formData: FormData) => {
    loading.value = true
    try {
      const response = await request.post<RetouchVersion>(`/retouch/tasks/${taskId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      ElMessage.success('修图已提交')
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '提交失败')
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchRetouchVersions = async (photoId: number) => {
    try {
      const response = await request.get<RetouchVersion[]>(`/photos/${photoId}/retouch-versions`)
      retouchVersions.value = response
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '获取修图版本失败')
      throw error
    }
  }

  const approveRetouch = async (taskId: number) => {
    try {
      const response = await request.post<RetouchTask>(`/retouch/tasks/${taskId}/approve`)
      const task = retouchTasks.value.find(t => t.id === taskId)
      if (task) {
        Object.assign(task, response)
      }
      ElMessage.success('已通过验收')
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '操作失败')
      throw error
    }
  }

  const rejectRetouch = async (taskId: number, reason: string) => {
    try {
      const response = await request.post<RetouchTask>(`/retouch/tasks/${taskId}/reject`, { reason })
      const task = retouchTasks.value.find(t => t.id === taskId)
      if (task) {
        Object.assign(task, response)
      }
      ElMessage.success('已驳回，修图师将重新修改')
      return response
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '操作失败')
      throw error
    }
  }

  return {
    photos,
    currentPhoto,
    comments,
    retouchTasks,
    retouchVersions,
    loading,
    total,
    selectedPhotos,
    mustSelectPhotos,
    alternativePhotos,
    rejectedPhotos,
    fetchPhotos,
    fetchPhotoById,
    ratePhoto,
    togglePhotoSelection,
    fetchComments,
    addComment,
    fetchRetouchTasks,
    claimTask,
    submitRetouch,
    fetchRetouchVersions,
    approveRetouch,
    rejectRetouch
  }
})
