import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Lesson, Annotation, LessonReport, SheetMusic, Recording } from '@/types'
import {
  getLessonDetailApi,
  startLessonApi,
  endLessonApi,
  saveAnnotationApi,
  getLessonReportApi,
  getRecordingListApi,
  getRecordingDetailApi,
  getSheetMusicListApi
} from '@/api/lesson'

export const useLessonStore = defineStore('lesson', () => {
  const currentLesson = ref<Lesson | null>(null)
  const annotations = ref<Annotation[]>([])
  const report = ref<LessonReport | null>(null)
  const recordings = ref<Recording[]>([])
  const currentRecording = ref<Recording | null>(null)
  const sheetMusicList = ref<SheetMusic[]>([])
  const currentSheetMusic = ref<SheetMusic | null>(null)
  const loading = ref(false)

  async function fetchLessonDetail(lessonId: number) {
    loading.value = true
    try {
      const res = await getLessonDetailApi(lessonId)
      currentLesson.value = res
      if (res.annotations) {
        annotations.value = res.annotations
      }
      return res
    } finally {
      loading.value = false
    }
  }

  async function startLesson(lessonId: number) {
    const res = await startLessonApi(lessonId)
    currentLesson.value = res
    return res
  }

  async function endLesson(lessonId: number) {
    const res = await endLessonApi(lessonId)
    currentLesson.value = res
    return res
  }

  async function saveAnnotation(annotation: Omit<Annotation, 'id' | 'createdAt' | 'authorId'>) {
    const res = await saveAnnotationApi(annotation)
    annotations.value.push(res)
    return res
  }

  function addLocalAnnotation(annotation: Annotation) {
    annotations.value.push(annotation)
  }

  async function fetchLessonReport(lessonId: number) {
    loading.value = true
    try {
      const res = await getLessonReportApi(lessonId)
      report.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  async function fetchRecordings() {
    loading.value = true
    try {
      const res = await getRecordingListApi()
      recordings.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  async function fetchRecordingDetail(recordingId: number) {
    loading.value = true
    try {
      const res = await getRecordingDetailApi(recordingId)
      currentRecording.value = res
      annotations.value = res.annotations || []
      return res
    } finally {
      loading.value = false
    }
  }

  async function fetchSheetMusicList() {
    const res = await getSheetMusicListApi()
    sheetMusicList.value = res
    return res
  }

  function setCurrentSheetMusic(sheetMusic: SheetMusic | null) {
    currentSheetMusic.value = sheetMusic
  }

  function clearLessonData() {
    currentLesson.value = null
    annotations.value = []
    report.value = null
    currentRecording.value = null
  }

  return {
    currentLesson,
    annotations,
    report,
    recordings,
    currentRecording,
    sheetMusicList,
    currentSheetMusic,
    loading,
    fetchLessonDetail,
    startLesson,
    endLesson,
    saveAnnotation,
    addLocalAnnotation,
    fetchLessonReport,
    fetchRecordings,
    fetchRecordingDetail,
    fetchSheetMusicList,
    setCurrentSheetMusic,
    clearLessonData
  }
})
