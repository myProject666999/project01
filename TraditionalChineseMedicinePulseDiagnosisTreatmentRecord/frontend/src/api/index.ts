import request from '@/utils/request'
import type { Patient, PageResult, Consultation, Herb, Prescription, ValidationResult, CompatibilityRule, PrescriptionItem } from '@/types'

export const patientApi = {
  getPage: (params: { pageNum: number; pageSize: number; name?: string; phone?: string }) =>
    request.get<PageResult<Patient>>('/patients', { params }),

  getAll: () => request.get<Patient[]>('/patients/all'),

  getById: (id: number) => request.get<Patient>(`/patients/${id}`),

  create: (data: Patient) => request.post<Patient>('/patients', data),

  update: (id: number, data: Patient) => request.put<Patient>(`/patients/${id}`, data),

  delete: (id: number) => request.delete(`/patients/${id}`)
}

export const consultationApi = {
  getPage: (params: { pageNum: number; pageSize: number; patientId?: number; keyword?: string }) =>
    request.get<PageResult<Consultation>>('/consultations', { params }),

  getByPatientId: (patientId: number) => request.get<Consultation[]>(`/consultations/patient/${patientId}`),

  getById: (id: number) => request.get<Consultation>(`/consultations/${id}`),

  create: (data: Consultation) => request.post<Consultation>('/consultations', data),

  update: (id: number, data: Consultation) => request.put<Consultation>(`/consultations/${id}`, data),

  delete: (id: number) => request.delete(`/consultations/${id}`)
}

export const herbApi = {
  getPage: (params: { pageNum: number; pageSize: number; keyword?: string }) =>
    request.get<PageResult<Herb>>('/herbs', { params }),

  getAll: () => request.get<Herb[]>('/herbs/all'),

  getById: (id: number) => request.get<Herb>(`/herbs/${id}`),

  search: (name: string) => request.get<Herb>('/herbs/search', { params: { name } }),

  getAliases: (herbId: number) => request.get<Herb[]>(`/herbs/${herbId}/aliases`),

  addAlias: (herbId: number, aliasName: string) =>
    request.post<Herb>(`/herbs/${herbId}/aliases`, { aliasName }),

  removeAlias: (aliasId: number) => request.delete(`/herbs/aliases/${aliasId}`)
}

export const compatibilityApi = {
  validatePair: (herb1: string, herb2: string) =>
    request.get<ValidationResult>('/compatibility/validate', { params: { herb1, herb2 } }),

  validatePrescription: (herbNames: string[]) =>
    request.post<ValidationResult[]>('/compatibility/validate-prescription', herbNames),

  validateItems: (items: PrescriptionItem[]) =>
    request.post<ValidationResult[]>('/compatibility/validate-items', items),

  getAllRules: () => request.get<CompatibilityRule[]>('/compatibility/rules'),

  getEighteen: () => request.get<CompatibilityRule[]>('/compatibility/rules/eighteen'),

  getNineteen: () => request.get<CompatibilityRule[]>('/compatibility/rules/nineteen')
}

export const prescriptionApi = {
  getPage: (params: { pageNum: number; pageSize: number; patientId?: number; doctorName?: string }) =>
    request.get<PageResult<Prescription>>('/prescriptions', { params }),

  getByPatientId: (patientId: number) => request.get<Prescription[]>(`/prescriptions/patient/${patientId}`),

  getForComparison: (patientId: number) => request.get<Prescription[]>(`/prescriptions/patient/${patientId}/comparison`),

  getById: (id: number) => request.get<Prescription>(`/prescriptions/${id}`),

  getDetailById: (id: number) => request.get<Prescription>(`/prescriptions/${id}/detail`),

  getLatest: (patientId: number) => request.get<Prescription>(`/prescriptions/patient/${patientId}/latest`),

  create: (data: Prescription) => request.post<Prescription>('/prescriptions', data),

  update: (id: number, data: Prescription) => request.put<Prescription>(`/prescriptions/${id}`, data),

  addFlavor: (sourceId: number, data: Prescription) =>
    request.post<Prescription>(`/prescriptions/${sourceId}/add-flavor`, data),

  removeFlavor: (sourceId: number, data: Prescription) =>
    request.post<Prescription>(`/prescriptions/${sourceId}/remove-flavor`, data),

  delete: (id: number) => request.delete(`/prescriptions/${id}`),

  validate: (data: Prescription) =>
    request.post<ValidationResult[]>('/prescriptions/validate', data)
}

export const uploadApi = {
  uploadTongueImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<{ url: string; filename: string; originalFilename: string }>(
      '/upload/tongue',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
  }
}
