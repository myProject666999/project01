import { create } from 'zustand';
import api from '@/utils/api';

export type MediaType = 'poster' | 'press_release' | 'other';

export interface MediaItem {
  id: number;
  title: string;
  type: MediaType;
  exhibitionId: number;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaVersion {
  id: number;
  mediaItemId: number;
  versionNumber: number;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  uploadedBy: number | null;
  changeLog: string | null;
  createdAt: string;
}

interface MediaState {
  mediaItems: MediaItem[];
  versions: MediaVersion[];
  loading: boolean;
  error: string | null;
  fetchByExhibition: (exhibitionId: number) => Promise<void>;
  create: (exhibitionId: number, data: Partial<MediaItem>, file?: File) => Promise<void>;
  update: (exhibitionId: number, id: number, data: Partial<MediaItem>) => Promise<void>;
  delete: (exhibitionId: number, id: number) => Promise<void>;
  fetchVersions: (exhibitionId: number, mediaItemId: number) => Promise<void>;
  addVersion: (exhibitionId: number, mediaItemId: number, file: File, changeLog: string) => Promise<void>;
}

const useMediaStore = create<MediaState>((set, get) => ({
  mediaItems: [],
  versions: [],
  loading: false,
  error: null,

  fetchByExhibition: async (exhibitionId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/media', { params: { exhibitionId } });
      set({ mediaItems: res.data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  create: async (exhibitionId: number, data: Partial<MediaItem>, file?: File) => {
    try {
      const res = await api.post('/media', { ...data, exhibitionId });
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/media/${res.data.id}/versions`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      set({ mediaItems: [...get().mediaItems, res.data] });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  update: async (_exhibitionId: number, id: number, data: Partial<MediaItem>) => {
    try {
      const res = await api.put(`/media/${id}`, data);
      set({ mediaItems: get().mediaItems.map((m) => (m.id === id ? res.data : m)) });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  delete: async (_exhibitionId: number, id: number) => {
    try {
      await api.delete(`/media/${id}`);
      set({ mediaItems: get().mediaItems.filter((m) => m.id !== id) });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchVersions: async (_exhibitionId: number, mediaItemId: number) => {
    try {
      const res = await api.get(`/media/${mediaItemId}/versions`);
      set({ versions: res.data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  addVersion: async (_exhibitionId: number, mediaItemId: number, file: File, changeLog: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('changeLog', changeLog);
      await api.post(`/media/${mediaItemId}/versions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await get().fetchVersions(_exhibitionId, mediaItemId);
      const itemsRes = await api.get('/media', { params: { exhibitionId: _exhibitionId } });
      set({ mediaItems: itemsRes.data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));

export default useMediaStore;
