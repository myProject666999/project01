import { create } from 'zustand';
import api from '@/utils/api';

export type TransportStatus = 'shipped' | 'in_transit' | 'arrived' | 'unpacked' | 'hung' | 'dismantled' | 'returned';

export interface Artwork {
  id: number;
  title: string;
  image: string | null;
  transportStatus: TransportStatus | null;
  artistId: number;
  exhibitionId: number;
  medium: string | null;
  dimensions: string | null;
  year: number | null;
  positionX: number | null;
  positionY: number | null;
  rotation: number | null;
  wallLabel: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  artist?: { id: number; name: string; avatar?: string | null };
}

interface ArtworkState {
  artworks: Artwork[];
  currentArtwork: Artwork | null;
  loading: boolean;
  error: string | null;
  fetchByExhibition: (exhibitionId: number) => Promise<void>;
  create: (exhibitionId: number, data: Partial<Artwork>) => Promise<void>;
  update: (exhibitionId: number, id: number, data: Partial<Artwork>) => Promise<void>;
  delete: (exhibitionId: number, id: number) => Promise<void>;
  updateStatus: (exhibitionId: number, id: number, transportStatus: string, remark?: string) => Promise<void>;
  batchUpdateStatus: (exhibitionId: number, ids: number[], transportStatus: string, remark?: string) => Promise<void>;
  setCurrentArtwork: (artwork: Artwork | null) => void;
}

export const useArtworkStore = create<ArtworkState>((set, get) => ({
  artworks: [],
  currentArtwork: null,
  loading: false,
  error: null,

  fetchByExhibition: async (exhibitionId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get<Artwork[]>('/artworks', { params: { exhibitionId } });
      set({ artworks: res.data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  create: async (exhibitionId: number, data: Partial<Artwork>) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<Artwork>('/artworks', { ...data, exhibitionId });
      set({ artworks: [res.data, ...get().artworks], loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  update: async (_exhibitionId: number, id: number, data: Partial<Artwork>) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put<Artwork>(`/artworks/${id}`, data);
      set({
        artworks: get().artworks.map((a) => (a.id === id ? res.data : a)),
        currentArtwork: get().currentArtwork?.id === id ? res.data : get().currentArtwork,
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
      await api.delete(`/artworks/${id}`);
      set({
        artworks: get().artworks.filter((a) => a.id !== id),
        currentArtwork: get().currentArtwork?.id === id ? null : get().currentArtwork,
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  updateStatus: async (_exhibitionId: number, id: number, transportStatus: string, _remark?: string) => {
    set({ loading: true, error: null });
    try {
      const res = await api.patch<Artwork>(`/artworks/${id}/status`, { transportStatus });
      set({
        artworks: get().artworks.map((a) => (a.id === id ? res.data : a)),
        currentArtwork: get().currentArtwork?.id === id ? res.data : get().currentArtwork,
        loading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  batchUpdateStatus: async (_exhibitionId: number, ids: number[], transportStatus: string, _remark?: string) => {
    set({ loading: true, error: null });
    try {
      await api.post('/artworks/batch-status', {
        ids,
        transportStatus,
      });
      await get().fetchByExhibition(_exhibitionId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  setCurrentArtwork: (artwork: Artwork | null) => set({ currentArtwork: artwork }),
}));
