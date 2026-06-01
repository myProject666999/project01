import { create } from 'zustand';
import { api } from '@/utils/api';

export interface CellarSlot {
  id: number;
  rackNo: number;
  layerNo: number;
  positionNo: number;
  wineId: number | null;
  status: 'empty' | 'occupied' | 'approaching' | 'overdue';
  wine?: {
    chateau: string;
    vintage: number;
    region: string;
  };
}

export interface CellarLayout {
  totalRacks: number;
  layersPerRack: number;
  positionsPerLayer: number;
}

interface CellarState {
  slots: CellarSlot[];
  availableSlots: CellarSlot[];
  layout: CellarLayout;
  loading: boolean;
  error: string | null;
  fetchSlots: () => Promise<void>;
  fetchAvailableSlots: () => Promise<void>;
  fetchLayout: () => Promise<void>;
  stockIn: (wineId: number, slotId: number, date: string) => Promise<void>;
  stockOut: (inventoryId: number) => Promise<void>;
}

export const useCellarStore = create<CellarState>((set) => ({
  slots: [],
  availableSlots: [],
  layout: { totalRacks: 5, layersPerRack: 4, positionsPerLayer: 6 },
  loading: false,
  error: null,

  fetchSlots: async () => {
    set({ loading: true, error: null });
    try {
      const slots = await api.get<CellarSlot[]>('/cellar/slots');
      set({ slots, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  fetchAvailableSlots: async () => {
    set({ loading: true, error: null });
    try {
      const availableSlots = await api.get<CellarSlot[]>('/cellar/slots/available');
      set({ availableSlots, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  fetchLayout: async () => {
    try {
      const layout = await api.get<CellarLayout>('/cellar/layout');
      set({ layout });
    } catch {
      set({
        layout: { totalRacks: 5, layersPerRack: 4, positionsPerLayer: 6 },
      });
    }
  },

  stockIn: async (wineId, slotId, date) => {
    await api.post('/cellar/stock-in', { wineId, slotId, date });
    set((state) => ({
      availableSlots: state.availableSlots.filter((s) => s.id !== slotId),
    }));
  },

  stockOut: async (inventoryId) => {
    await api.post('/cellar/stock-out/' + inventoryId, {});
  },
}));
