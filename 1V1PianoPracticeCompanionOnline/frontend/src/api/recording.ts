import request from '@/utils/request'
import type { LessonRecording } from '@/types'

export function getRecordingsListApi(): Promise<LessonRecording[]> {
  return request.get('/lesson-recordings')
}

export function getRecordingDetailApi(id: number): Promise<LessonRecording> {
  return request.get(`/lesson-recordings/${id}`)
}
