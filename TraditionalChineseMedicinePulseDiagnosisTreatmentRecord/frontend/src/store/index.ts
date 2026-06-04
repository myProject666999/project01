import { create } from 'zustand'
import type { Patient, Consultation, Prescription } from '@/types'

interface AppState {
  currentPatient: Patient | null
  currentConsultation: Consultation | null
  currentPrescription: Prescription | null
  sourcePrescription: Prescription | null
  refreshKey: number

  setCurrentPatient: (patient: Patient | null) => void
  setCurrentConsultation: (consultation: Consultation | null) => void
  setCurrentPrescription: (prescription: Prescription | null) => void
  setSourcePrescription: (prescription: Prescription | null) => void
  triggerRefresh: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentPatient: null,
  currentConsultation: null,
  currentPrescription: null,
  sourcePrescription: null,
  refreshKey: 0,

  setCurrentPatient: (patient) => set({ currentPatient: patient }),
  setCurrentConsultation: (consultation) => set({ currentConsultation: consultation }),
  setCurrentPrescription: (prescription) => set({ currentPrescription: prescription }),
  setSourcePrescription: (prescription) => set({ sourcePrescription: prescription }),
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 }))
}))
