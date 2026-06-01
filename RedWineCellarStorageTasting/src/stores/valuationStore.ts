import { create } from 'zustand';
import { api } from '@/utils/api';

export interface ValuationSummary {
  totalBottles: number;
  totalPurchaseCost: number;
  totalMarketValue: number;
  appreciationRate: number;
}

export interface ValuationDetail {
  wineId: number;
  chateau: string;
  vintage: number;
  region: string;
  bottleCount: number;
  purchasePrice: number;
  marketPrice: number;
  totalPurchaseCost: number;
  totalMarketValue: number;
  appreciationRate: number;
}

interface ValuationState {
  summary: ValuationSummary;
  details: ValuationDetail[];
  loading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
  fetchDetails: () => Promise<void>;
  updateMarketPrice: (wineId: number, marketPrice: number) => Promise<void>;
}

export const useValuationStore = create<ValuationState>((set) => ({
  summary: {
    totalBottles: 0,
    totalPurchaseCost: 0,
    totalMarketValue: 0,
    appreciationRate: 0,
  },
  details: [],
  loading: false,
  error: null,

  fetchSummary: async () => {
    set({ loading: true, error: null });
    try {
      const summary = await api.get<ValuationSummary>('/valuation/summary');
      set({ summary, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  fetchDetails: async () => {
    set({ loading: true, error: null });
    try {
      const details = await api.get<ValuationDetail[]>('/valuation/details');
      set({ details, loading: false });
    } catch (e: any) {
      set({ error: e.message, loading: false });
    }
  },

  updateMarketPrice: async (wineId, marketPrice) => {
    await api.put(`/valuation/market-price/${wineId}`, { marketPrice });
    set((state) => ({
      details: state.details.map((d) =>
        d.wineId === wineId
          ? {
              ...d,
              marketPrice,
              totalMarketValue: d.bottleCount * marketPrice,
              appreciationRate:
                d.purchasePrice > 0
                  ? ((marketPrice - d.purchasePrice) / d.purchasePrice) * 100
                  : 0,
            }
          : d
      ),
    }));
  },
}));
