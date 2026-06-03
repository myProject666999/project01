import { create } from 'zustand'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

interface User {
  id: number
  username: string
  name: string
}

interface AppState {
  sidebarCollapsed: boolean
  currentUser: User | null
  notifications: Notification[]

  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setCurrentUser: (user: User | null) => void
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  currentUser: { id: 1, username: 'admin', name: '管理员' },
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentUser: (user) => set({ currentUser: user }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Date.now().toString(),
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  clearNotifications: () => set({ notifications: [] }),
}))
