import { create } from 'zustand'
import type { AppSettings } from '@typings/settings'
import { DEFAULT_SETTINGS, PROVIDER_MODELS, PROVIDER_ENDPOINTS } from '@typings/settings'
import type { AppMode, ProviderType } from '@typings/ai'

interface SettingsState extends AppSettings {
  isLoaded: boolean
  loadSettings: () => Promise<void>
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>
  setProvider: (provider: ProviderType) => Promise<void>
  setAppMode: (mode: AppMode) => Promise<void>
  setShortcut: (shortcut: string) => Promise<boolean>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettings: async () => {
    try {
      const settings = (await window.electronAPI.getSettings()) as AppSettings
      
      // Forcefully migrate to Gemini and ignore old settings
      settings.provider = 'gemini'
      if (!settings.apiEndpoint.includes('googleapis.com')) {
        settings.apiEndpoint = PROVIDER_ENDPOINTS['gemini']
      }
      if (!PROVIDER_MODELS['gemini'].includes(settings.model)) {
        settings.model = PROVIDER_MODELS['gemini'][1]
      }
      
      // Auto-migrate from gemini-2.5-pro to gemini-2.5-flash if they hit the 429 error
      if (settings.model === 'gemini-2.5-pro') {
        settings.model = 'gemini-2.5-flash'
      }
      await window.electronAPI.setSettings(settings as unknown as Record<string, unknown>)
      
      set({ ...settings, isLoaded: true })
    } catch (error) {
      console.error('Failed to load settings:', error)
      set({ isLoaded: true })
    }
  },

  updateSettings: async (partial) => {
    const current = get()
    const updated = { ...current, ...partial }
    set(partial)
    try {
      await window.electronAPI.setSettings(updated as unknown as Record<string, unknown>)
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  },

  setTheme: async (theme) => {
    set({ theme })
    await get().updateSettings({ theme })
    applyTheme(theme)
  },

  setProvider: async (provider) => {
    const models = PROVIDER_MODELS[provider]
    const updates: Partial<AppSettings> = { provider }
    if (models && models.length > 0) {
      updates.model = models[0]
      updates.apiEndpoint = PROVIDER_ENDPOINTS[provider]
    }
    set(updates)
    await get().updateSettings(updates)
  },

  setAppMode: async (mode) => {
    set({ appMode: mode })
    await get().updateSettings({ appMode: mode })
  },

  setShortcut: async (shortcut) => {
    try {
      const success = await window.electronAPI.updateShortcut(shortcut)
      if (success) {
        set({ shortcut })
        await get().updateSettings({ shortcut })
      }
      return success
    } catch {
      return false
    }
  }
}))

function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.add(isDark ? 'dark' : 'light')
  } else {
    root.classList.add(theme)
  }
}
