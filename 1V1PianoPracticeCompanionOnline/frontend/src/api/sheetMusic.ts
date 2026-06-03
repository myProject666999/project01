import request from '@/utils/request'
import type { SheetMusic } from '@/types'

export function getSheetMusicListApi(): Promise<SheetMusic[]> {
  return request.get('/sheet-music')
}

export function getSheetMusicDetailApi(id: number): Promise<SheetMusic> {
  return request.get(`/sheet-music/${id}`)
}
