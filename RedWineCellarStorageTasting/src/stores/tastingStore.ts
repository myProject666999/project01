import { create } from 'zustand';
import { api } from '@/utils/api';

export interface TastingNote {
  id: number;
  wineId: number;
  inventoryId: number;
  tastingDate: string;
  companions: string;
  appearanceScore: number;
  aromaScore: number;
  tasteScore: number;
  overallScore: number;
  notes: string;
  createdAt: string;
  wine?: {
    chateau: string;
    vintage: number;
  };
}

interface TastingState {
  list: TastingNote[];
  loading: boolean;
  error: string | null;
  fetchByWine: (wineId: number) => Promise<void>;
  fetchAll: () => Promise<void>;
  createNote: (data: Partial<TastingNote>) => Promise<TastingNote>;
  updateNote: (id: number, data: Partial<TastingNote>) => Promise<TastingNote>;
}

export const useTastingStore = create<TastingState>((set) => ({
  list: [],
  loading: false,
  error: null,

  fetchByWine: async (wineId: number) => {
    set({ loading: true, error: null });
    try {
      const list = await api.get<TastingNote[]>(`/tasting-notes/wine/${wineId}`);
      set({ list, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const list = await api.get<TastingNote[]>('/tasting-notes');
      set({ list, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  createNote: async (data) => {
    const note = await api.post<TastingNote>('/tasting-notes', data);
    set((state) => ({ list: [...state.list, note] }));
    return note;
  },

  updateNote: async (id, data) => {
    const note = await api.put<TastingNote>(`/tasting-notes/${id}`, data);
    set((state) => ({
      list: state.list.map((n) => (n.id === id ? note : n)),
    }));
    return note;
  },
}));
