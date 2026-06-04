export interface Patient {
  id?: number
  name: string
  gender: string
  age: number
  phone?: string
  idCard?: string
  address?: string
  remark?: string
  createdAt?: string
  updatedAt?: string
}

export interface Consultation {
  id?: number
  patientId: number
  complexion?: string
  tongueAppearance?: string
  tongueImageUrl?: string
  breath?: string
  cough?: string
  voice?: string
  chiefComplaint: string
  associatedSymptoms?: string
  stool?: string
  urine?: string
  pulseTypes?: string
  visitDate: string
  remark?: string
  patient?: Patient
}

export interface Herb {
  id?: number
  name: string
  category?: string
  nature?: string
  flavor?: string
  channelTropism?: string
  dosageRange?: string
  contraindications?: string
  description?: string
  aliases?: HerbAlias[]
}

export interface HerbAlias {
  id?: number
  herbId: number
  aliasName: string
}

export interface Prescription {
  id?: number
  patientId: number
  consultationId?: number
  diagnosis?: string
  totalDosage?: number
  prescriptionUsage?: string
  doctorName?: string
  createdAt?: string
  items: PrescriptionItem[]
  patient?: Patient
  consultation?: Consultation
}

export interface PrescriptionItem {
  id?: number
  prescriptionId?: number
  herbId?: number
  herbName: string
  dosage: number
  preparationMethod?: string
}

export interface ValidationResult {
  valid: boolean
  herbA?: string
  herbB?: string
  ruleType?: string
  description?: string
}

export interface CompatibilityRule {
  id?: number
  herbAId: number
  herbBId: number
  ruleType: string
  description?: string
  herbA?: Herb
  herbB?: Herb
}

export interface PageResult<T> {
  records: T[]
  total: number
  pageNum: number
  pageSize: number
}

export interface Result<T> {
  code: number
  message: string
  data: T
}

export const PULSE_TYPES = [
  '浮脉', '沉脉', '迟脉', '数脉', '虚脉', '实脉',
  '洪脉', '细脉', '滑脉', '涩脉', '弦脉', '紧脉',
  '缓脉', '芤脉', '结脉', '代脉', '促脉', '动脉',
  '浮紧', '浮缓', '沉迟', '沉细', '弦滑', '滑数',
  '细数', '弦数', '濡脉', '弱脉', '微脉', '散脉'
] as const

export const PREPARATION_METHODS = [
  '常规煎服', '先煎', '后下', '包煎', '另煎', '冲服', '烊化'
] as const

export const GENDER_OPTIONS = [
  { label: '男', value: 'MALE' },
  { label: '女', value: 'FEMALE' }
]
