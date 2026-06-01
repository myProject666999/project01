import { create } from 'zustand';
import api from '@/utils/api';

export type ExhibitionStatus = 'planning' | 'preparing' | 'installing' | 'open' | 'closed' | 'dismantling';

export interface Exhibition {
  id: number;
  name: string;
  venue: string;
  address: string | null;
  startDate: string;
  endDate: string;
  status: ExhibitionStatus;
  description: string | null;
  coverImage: string | null;
  curatorId: number | null;
  createdAt: string;
  updatedAt: string;
  artists?: any[];
  guests?: any[];
  floorPlan?: any;
  mediaItems?: any[];
}

interface ExhibitionForm {
  name: string;
  venue: string;
  address: string;
  startDate: string;
  endDate: string;
  status: ExhibitionStatus;
  description: string;
  coverImage: string;
}

interface ExhibitionState {
  exhibitions: Exhibition[];
  currentExhibition: Exhibition | null;
  isLoading: boolean;
  error: string | null;
  fetchExhibitions: () => Promise<void>;
  fetchExhibition: (id: number) => Promise<void>;
  createExhibition: (data: ExhibitionForm) => Promise<void>;
  updateExhibition: (id: number, data: Partial<ExhibitionForm>) => Promise<void>;
  deleteExhibition: (id: number) => Promise<void>;
  clearCurrent: () => void;
}

export const useExhibitionStore = create<ExhibitionState>((set) => ({
  exhibitions: [],
  currentExhibition: null,
  isLoading: false,
  error: null,

  fetchExhibitions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/exhibitions');
      set({ exhibitions: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchExhibition: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/exhibitions/${id}`);
      set({ currentExhibition: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createExhibition: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: newExhibition } = await api.post('/exhibitions', data);
      set((state) => ({
        exhibitions: [...state.exhibitions, newExhibition],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateExhibition: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updated } = await api.put(`/exhibitions/${id}`, data);
      set((state) => ({
        exhibitions: state.exhibitions.map((e) => (e.id === id ? updated : e)),
        currentExhibition: state.currentExhibition?.id === id ? updated : state.currentExhibition,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteExhibition: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/exhibitions/${id}`);
      set((state) => ({
        exhibitions: state.exhibitions.filter((e) => e.id !== id),
        currentExhibition: state.currentExhibition?.id === id ? null : state.currentExhibition,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearCurrent: () => set({ currentExhibition: null }),
}));
