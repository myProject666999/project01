export interface User {
  id: number
  phone: string
  name: string
  avatar?: string
  role: number
  created_at?: string
}

export interface Course {
  id: number
  name: string
  category: string
  teacher: string
  description?: string
  schedule_day: string
  schedule_time: string
  classroom: string
  capacity: number
  enrolled_count: number
  status: number
  image?: string
  created_at?: string
  updated_at?: string
}

export interface Enrollment {
  id: number
  user_id: number
  course_id: number
  status: number
  created_at: string
  updated_at?: string
  course?: Course
}

export interface WaitlistEntry {
  id: number
  user_id: number
  course_id: number
  position: number
  status: number
  created_at: string
  updated_at?: string
  course?: Course
}

export interface AttendanceRecord {
  id: number
  enrollment_id: number
  attendance_date: string
  status: number
  remark?: string
  created_at: string
  course?: Course
}

export interface AttendanceStats {
  present: number
  absent: number
  leave: number
}

export interface Club {
  id: number
  name: string
  description?: string
  member_count: number
  image?: string
  created_at?: string
  updated_at?: string
}

export interface Activity {
  id: number
  club_id: number
  title: string
  description?: string
  location: string
  start_time: string
  end_time: string
  capacity: number
  registered_count: number
  status: number
  created_at?: string
  club?: Club
}

export interface Announcement {
  id: number
  title: string
  content: string
  type: number
  status: number
  created_at: string
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
