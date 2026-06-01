import { create } from 'zustand';
import api from '@/utils/api';

export type ConfirmStatus = 'pending' | 'confirmed' | 'withdrawn';

export interface Artist {
  id: number;
  name: string;
  avatar: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  confirmStatus: ConfirmStatus;
  exhibitionId: number;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ArtistState {
  artists: Artist[];
  currentArtist: Artist | null;
  loading: boolean;
  error: string | null;
  fetchByExhibition: (exhibitionId: number) => Promise<void>;
  create: (exhibitionId: number, data: Partial<Artist>) => Promise<void>;
  update: (exhibitionId: number, id: number, data: Partial<Artist>) => Promise<void>;
  delete: (exhibitionId: number, id: number) => Promise<void>;
  confirm: (exhibitionId: number, id: number) => Promise<void>;
  withdraw: (exhibitionId: number, id: number, reason?: string) => Promise<void>;
  replace: (exhibitionId: number, id: number, replacementData: Record<string, string>) => Promise<void>;
  setCurrentArtist: (artist: Artist | null) => void;
}

export const useArtistStore = create<ArtistState>((set, get) => ({
  artists: [],
  currentArtist: null,
  loading: false,
  error: null,

  fetchByExhibition: async (exhibitionId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<Artist[]>('/artists', { params: { exhibitionId } });
      set({ artists: res.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  create: async (exhibitionId: number, data: Partial<Artist>) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<Artist>('/artists', { ...data, exhibitionId });
      set({ artists: [res.data, ...get().artists], loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  update: async (_exhibitionId: number, id: number, data: Partial<Artist>) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put<Artist>(`/artists/${id}`, data);
      set({
        artists: get().artists.map((a) => (a.id === id ? res.data : a)),
        currentArtist: get().currentArtist?.id === id ? res.data : get().currentArtist,
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  delete: async (_exhibitionId: number, id: number) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/artists/${id}`);
      set({
        artists: get().artists.filter((a) => a.id !== id),
        currentArtist: get().currentArtist?.id === id ? null : get().currentArtist,
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  confirm: async (_exhibitionId: number, id: number) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<Artist>(`/artists/${id}/confirm`);
      set({
        artists: get().artists.map((a) => (a.id === id ? res.data : a)),
        currentArtist: get().currentArtist?.id === id ? res.data : get().currentArtist,
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  withdraw: async (_exhibitionId: number, id: number) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<Artist>(`/artists/${id}/withdraw`);
      set({
        artists: get().artists.map((a) => (a.id === id ? res.data : a)),
        currentArtist: get().currentArtist?.id === id ? res.data : get().currentArtist,
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  replace: async (_exhibitionId: number, id: number, replacementData: Record<string, string>) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<Artist>(`/artists/${id}/replace`, replacementData);
      set({
        artists: [res.data, ...get().artists.map((a) => (a.id === id ? { ...a, confirmStatus: 'withdrawn' as const } : a))],
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  setCurrentArtist: (artist: Artist | null) => set({ currentArtist: artist }),
}));
