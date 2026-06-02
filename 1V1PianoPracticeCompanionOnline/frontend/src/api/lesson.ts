import request from '@/utils/request'
import type { Lesson, Annotation, LessonReport, SheetMusic, Recording } from '@/types'

export function getLessonDetailApi(lessonId: number): Promise<Lesson> {
  return request.get(`/lessons/${lessonId}`)
}

export function startLessonApi(lessonId: number): Promise<Lesson> {
  return request.put(`/lessons/${lessonId}/start`)
}

export function endLessonApi(lessonId: number): Promise<Lesson> {
  return request.put(`/lessons/${lessonId}/end`)
}

export function saveAnnotationApi(
  annotation: Omit<Annotation, 'id' | 'createdAt' | 'authorId'>
): Promise<Annotation> {
  return request.post('/annotations', annotation)
}

export function getAnnotationsApi(lessonId: number): Promise<Annotation[]> {
  return request.get(`/lessons/${lessonId}/annotations`)
}

export function updateAnnotationApi(
  annotationId: string,
  data: Partial<Annotation>
): Promise<Annotation> {
  return request.put(`/annotations/${annotationId}`, data)
}

export function deleteAnnotationApi(annotationId: string): Promise<void> {
  return request.delete(`/annotations/${annotationId}`)
}

export function getLessonReportApi(lessonId: number): Promise<LessonReport> {
  return request.get(`/lessons/${lessonId}/report`)
}

export function createLessonReportApi(
  lessonId: number,
  data: Omit<LessonReport, 'id' | 'lessonId' | 'createdAt'>
): Promise<LessonReport> {
  return request.post(`/lessons/${lessonId}/report`, data)
}

export function getRecordingListApi(): Promise<Recording[]> {
  return request.get('/recordings')
}

export function getRecordingDetailApi(recordingId: number): Promise<Recording> {
  return request.get(`/recordings/${recordingId}`)
}

export function getSheetMusicListApi(): Promise<SheetMusic[]> {
  return request.get('/sheet-music')
}

export function getSheetMusicDetailApi(sheetMusicId: number): Promise<SheetMusic> {
  return request.get(`/sheet-music/${sheetMusicId}`)
}

export function uploadSheetMusicApi(file: File, data: { title: string; composer: string; difficulty: string }): Promise<SheetMusic> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', data.title)
  formData.append('composer', data.composer)
  formData.append('difficulty', data.difficulty)
  return request.post('/sheet-music', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
