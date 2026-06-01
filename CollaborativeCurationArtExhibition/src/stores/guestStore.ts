import { create } from 'zustand';
import api from '@/utils/api';

export type GuestCategory = 'vvip' | 'vip' | 'media' | 'general';
export type InviteStatus = 'pending' | 'sent' | 'accepted' | 'declined';
export type CheckinStatus = 'not_checked_in' | 'checked_in';
export type CheckinMethod = 'qrcode' | 'face' | 'manual';

export interface Guest {
  id: number;
  name: string;
  category: GuestCategory | null;
  phone: string | null;
  email: string | null;
  organization: string | null;
  exhibitionId: number;
  inviteStatus: InviteStatus;
  checkinStatus: CheckinStatus;
  checkinAt: string | null;
  checkinMethod: CheckinMethod | null;
  faceEmbedding: string | null;
  qrcodeToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckinStats {
  total: number;
  checkedIn: number;
  notCheckedIn: number;
  rate: number;
}

interface GuestState {
  guests: Guest[];
  checkinStats: CheckinStats | null;
  loading: boolean;
  error: string | null;
  fetchByExhibition: (exhibitionId: number) => Promise<void>;
  create: (exhibitionId: number, data: Partial<Guest>) => Promise<void>;
  update: (exhibitionId: number, id: number, data: Partial<Guest>) => Promise<void>;
  delete: (exhibitionId: number, id: number) => Promise<void>;
  checkin: (exhibitionId: number, id: number, method: string) => Promise<void>;
  fetchCheckinStats: (exhibitionId: number) => Promise<void>;
}

const useGuestStore = create<GuestState>((set, get) => ({
  guests: [],
  checkinStats: null,
  loading: false,
  error: null,

  fetchByExhibition: async (exhibitionId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/guests', { params: { exhibitionId } });
      set({ guests: res.data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  create: async (exhibitionId: number, data: Partial<Guest>) => {
    try {
      const res = await api.post('/guests', { ...data, exhibitionId });
      set({ guests: [...get().guests, res.data] });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  update: async (_exhibitionId: number, id: number, data: Partial<Guest>) => {
    try {
      const res = await api.put(`/guests/${id}`, data);
      set({ guests: get().guests.map((g) => (g.id === id ? res.data : g)) });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  delete: async (_exhibitionId: number, id: number) => {
    try {
      await api.delete(`/guests/${id}`);
      set({ guests: get().guests.filter((g) => g.id !== id) });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  checkin: async (exhibitionId: number, id: number, method: string) => {
    try {
      const res = await api.post(`/guests/${id}/checkin`, { method });
      set({ guests: get().guests.map((g) => (g.id === id ? res.data : g)) });
      get().fetchCheckinStats(exhibitionId);
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchCheckinStats: async (exhibitionId: number) => {
    try {
      const res = await api.get('/guests/checkin-stats', { params: { exhibitionId } });
      set({ checkinStats: res.data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));

export default useGuestStore;
