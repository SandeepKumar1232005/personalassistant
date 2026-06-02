import { create } from 'zustand'

type Page = 'home' | 'chat' | 'settings' | 'about'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

interface UIState {
  sidebarCollapsed: boolean
  currentPage: Page
  overlayVisible: boolean
  captureInProgress: boolean
  toasts: Toast[]

  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setCurrentPage: (page: Page) => void
  setOverlayVisible: (visible: boolean) => void
  setCaptureInProgress: (inProgress: boolean) => void
  addToast: (message: string, type: Toast['type'], duration?: number) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  currentPage: 'chat',
  overlayVisible: false,
  captureInProgress: false,
  toasts: [],

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setCurrentPage: (page) => set({ currentPage: page }),

  setOverlayVisible: (visible) => set({ overlayVisible: visible }),

  setCaptureInProgress: (inProgress) => set({ captureInProgress: inProgress }),

  addToast: (message, type, duration = 4000) => {
    const id = `toast_${Date.now()}`
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }]
    }))

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }))
      }, duration)
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  }
}))
