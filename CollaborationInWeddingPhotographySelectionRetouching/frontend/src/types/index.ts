export enum UserRole {
  COUPLE = 'couple',
  RETOUCHER = 'retoucher',
  ADMIN = 'admin'
}

export interface User {
  id: number
  username: string
  email: string
  role: UserRole
  name: string
  phone?: string
  avatar?: string
  createdAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SELECTING = 'selecting',
  SELECTED = 'selected',
  RETOUCHING = 'retouching',
  REVIEWING = 'reviewing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Order {
  id: number
  orderNo: string
  coupleId: number
  coupleName: string
  packageName: string
  totalPhotos: number
  selectedCount: number
  price: number
  status: OrderStatus
  shootDate?: string
  location?: string
  description?: string
  maxRetouchCount: number
  remainingRetouchCount: number
  createdAt: string
  updatedAt: string
}

export enum PhotoStatus {
  PENDING = 'pending',
  SELECTED = 'selected',
  REJECTED = 'rejected',
  RETOUCHING = 'retouching',
  COMPLETED = 'completed'
}

export enum PhotoRating {
  REJECTED = 1,
  ALTERNATIVE = 3,
  MUST_SELECT = 5
}

export interface Photo {
  id: number
  orderId: number
  originalUrl: string
  thumbnailUrl: string
  fileName: string
  status: PhotoStatus
  rating: PhotoRating
  isSelected: boolean
  hasRetouched: boolean
  retouchedUrl?: string
  uploadedAt: string
}

export interface PhotoComment {
  id: number
  photoId: number
  userId: number
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
}

export enum RetouchTaskStatus {
  PENDING = 'pending',
  CLAIMED = 'claimed',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface RetouchTask {
  id: number
  photoId: number
  orderId: number
  retoucherId?: number
  retoucherName?: string
  status: RetouchTaskStatus
  priority: number
  requirements?: string
  claimedAt?: string
  submittedAt?: string
  deadline?: string
}

export interface RetouchVersion {
  id: number
  taskId: number
  photoId: number
  version: number
  imageUrl: string
  remarks?: string
  isApproved: boolean
  createdAt: string
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
