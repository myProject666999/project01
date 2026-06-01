import { create } from 'zustand';
import { api } from '@/utils/api';

export interface Alert {
  id: number;
  wineId: number;
  chateau: string;
  vintage: number;
  region: string;
  drinkFrom: number;
  drinkTo: number;
  bottleCount: number;
  urgency: 'overdue' | 'urgent' | 'approaching' | 'safe';
  remainingYears: number;
}

interface AlertState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  fetchAlerts: () => Promise<void>;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  loading: false,
  error: null,

  fetchAlerts: async () => {
    set({ loading: true, error: null });
    try {
      const alerts = await api.get<Alert[]>('/alerts/drink-window');
      set({ alerts, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },
}));
