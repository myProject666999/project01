import request from '@/utils/request'
import type { CoursePackage } from '@/types'

export function getCoursePackagesApi(): Promise<CoursePackage[]> {
  return request.get('/course-packages')
}

export function getCoursePackageDetailApi(id: number): Promise<CoursePackage> {
  return request.get(`/course-packages/${id}`)
}

export function buyCoursePackageApi(packageId: number): Promise<any> {
  return request.post('/user-course-packages', { packageId })
}
