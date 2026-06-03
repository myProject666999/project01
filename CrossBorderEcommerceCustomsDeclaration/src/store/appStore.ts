import { create } from 'zustand';

interface AppState {
  sidebarCollapsed: boolean;
  currentMenu: string;
  toggleSidebar: () => void;
  setCurrentMenu: (menu: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  currentMenu: 'dashboard',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setCurrentMenu: (menu: string) => set({ currentMenu: menu }),
}));
