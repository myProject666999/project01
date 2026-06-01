import { create } from 'zustand';
import api from '@/utils/api';

export interface ArtworkLayout {
  artworkId: number;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
}

export interface LayoutData {
  artworks: ArtworkLayout[];
}

export interface FloorPlan {
  id: number;
  exhibitionId: number;
  layoutData: LayoutData | null;
  backgroundUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Artwork {
  id: number;
  title: string;
  image: string | null;
  transportStatus: string | null;
  artistId: number;
  exhibitionId: number;
  medium: string | null;
  dimensions: string | null;
  year: number | null;
}

interface FloorPlanState {
  floorplan: FloorPlan | null;
  artworks: Artwork[];
  loading: boolean;
  error: string | null;
  fetch: (exhibitionId: number) => Promise<void>;
  update: (exhibitionId: number, data: { layoutData?: LayoutData }) => Promise<void>;
  uploadBackground: (exhibitionId: number, file: File) => Promise<void>;
}

const useFloorplanStore = create<FloorPlanState>((set, get) => ({
  floorplan: null,
  artworks: [],
  loading: false,
  error: null,

  fetch: async (exhibitionId: number) => {
    set({ loading: true, error: null });
    try {
      const [floorplanRes, artworksRes] = await Promise.all([
        api.get(`/floor-plans/exhibition/${exhibitionId}`),
        api.get('/artworks', { params: { exhibitionId } }),
      ]);
      set({
        floorplan: floorplanRes.data,
        artworks: artworksRes.data,
        loading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  update: async (exhibitionId: number, data: { layoutData?: LayoutData }) => {
    const floorplan = get().floorplan;
    if (!floorplan) return;
    try {
      const res = await api.put(`/floor-plans/${floorplan.id}`, data);
      set({ floorplan: res.data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  uploadBackground: async (exhibitionId: number, file: File) => {
    const floorplan = get().floorplan;
    if (!floorplan) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/floor-plans/${floorplan.id}/upload-bg`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ floorplan: res.data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));

export default useFloorplanStore;
