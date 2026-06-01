import { create } from 'zustand';
import { api } from '@/utils/api';

export interface GrapeVariety {
  name: string;
  percentage: number;
}

export interface Wine {
  id: number;
  region: string;
  chateau: string;
  vintage: number;
  abv: number;
  drinkFrom: number;
  drinkTo: number;
  purchasePrice: number;
  marketPrice: number;
  grapeVarieties: GrapeVariety[];
  bottleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WineFilters {
  region?: string;
  chateau?: string;
  vintage?: number;
  drinkStatus?: string;
  search?: string;
}

interface WineState {
  wines: Wine[];
  current: Wine | null;
  filters: WineFilters;
  loading: boolean;
  error: string | null;
  fetchWines: (filters?: WineFilters) => Promise<void>;
  fetchWine: (id: number) => Promise<void>;
  createWine: (data: Partial<Wine>) => Promise<Wine>;
  updateWine: (id: number, data: Partial<Wine>) => Promise<Wine>;
  deleteWine: (id: number) => Promise<void>;
  setFilters: (filters: WineFilters) => void;
}

export const useWineStore = create<WineState>((set) => ({
  wines: [],
  current: null,
  filters: {},
  loading: false,
  error: null,

  fetchWines: async (filters?: WineFilters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      const f = filters || {};
      if (f.search) params.set('search', f.search);
      if (f.region) params.set('region', f.region);
      if (f.chateau) params.set('chateau', f.chateau);
      if (f.vintage) params.set('vintage', String(f.vintage));
      if (f.drinkStatus) params.set('drinkStatus', f.drinkStatus);
      const query = params.toString();
      const wines = await api.get<Wine[]>(`/wines${query ? `?${query}` : ''}`);
      set({ wines, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  fetchWine: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const wine = await api.get<Wine>(`/wines/${id}`);
      set({ current: wine, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  createWine: async (data) => {
    const wine = await api.post<Wine>('/wines', data);
    set((state) => ({ wines: [...state.wines, wine] }));
    return wine;
  },

  updateWine: async (id, data) => {
    const wine = await api.put<Wine>(`/wines/${id}`, data);
    set((state) => ({
      wines: state.wines.map((w) => (w.id === id ? wine : w)),
      current: state.current?.id === id ? wine : state.current,
    }));
    return wine;
  },

  deleteWine: async (id) => {
    await api.delete(`/wines/${id}`);
    set((state) => ({
      wines: state.wines.filter((w) => w.id !== id),
      current: state.current?.id === id ? null : state.current,
    }));
  },

  setFilters: (filters) => set({ filters }),
}));
