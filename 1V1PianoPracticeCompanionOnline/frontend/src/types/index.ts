export interface User {
  id: number
  username: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  avatar?: string
  phone?: string
  level?: number
  teachChinese?: boolean
  introduction?: string
  specialties?: string[]
  createdAt: string
}

export interface Teacher extends User {
  role: 'teacher'
  rating: number
  reviewCount: number
  hourlyRate: number
  teachChinese: boolean
  difficultyLevels: DifficultyLevel[]
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface TimeSlot {
  id: number
  teacherId: number
  startTime: string
  endTime: string
  isBooked: boolean
}

export interface Booking {
  id: number
  studentId: number
  teacherId: number
  timeSlotId: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  sheetMusicId?: number
  notes?: string
  createdAt: string
  updatedAt: string
  teacher?: Teacher
  student?: User
  timeSlot?: TimeSlot
  sheetMusic?: SheetMusic
}

export interface Lesson {
  id: number
  bookingId: number
  status: 'scheduled' | 'in-progress' | 'completed'
  startTime: string
  endTime?: string
  recordingUrl?: string
  annotations?: Annotation[]
  report?: LessonReport
}

export interface SheetMusic {
  id: number
  title: string
  composer: string
  difficulty: DifficultyLevel
  fileType: 'pdf' | 'image'
  fileUrl: string
  pageCount: number
  thumbnailUrl?: string
}

export interface Annotation {
  id: string
  type: 'text' | 'circle' | 'rect' | 'line' | 'freehand'
  pageNumber: number
  timestamp?: number
  x: number
  y: number
  width?: number
  height?: number
  color: string
  content?: string
  authorId: number
  createdAt: number
}

export interface LessonReport {
  id: number
  lessonId: number
  overallScore: number
  technicalScore: number
  expressionScore: number
  rhythmScore: number
  comments: string
  strengths: string[]
  improvements: string[]
  homework?: string
  createdAt: string
}

export interface CoursePackage {
  id: number
  name: string
  description: string
  level: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'all'
  totalLessons: number
  price: number
  lessonDuration: number
  validDays: number
  isActive: boolean
  createdAt: string
}

export interface UserCoursePackage {
  id: number
  userId: number
  packageId: number
  remainingLessons: number
  totalLessons: number
  purchaseDate: string
  expireDate: string
  status: 'active' | 'used_up' | 'expired'
  amountPaid: number
  package?: CoursePackage
}

export interface SheetMusic {
  id: number
  title: string
  composer: string
  difficultyLevel: string
  fileType: 'pdf' | 'image'
  fileUrl: string
  pageCount: number
  thumbnailUrl?: string
  createdBy?: number
  createdAt: string
}

export interface LessonRecording {
  id: number
  lessonId: number
  recordingType: 'teacher' | 'student' | 'combined'
  videoUrl: string
  durationSeconds: number
  fileSize: number
  annotationSyncData?: any
  createdAt: string
  lesson?: Lesson
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  role: 'student' | 'teacher'
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface TeacherFilterParams extends PaginationParams {
  difficulty?: DifficultyLevel
  teachChinese?: boolean
  keyword?: string
}
