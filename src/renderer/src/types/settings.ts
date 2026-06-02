import type { ProviderType, AppMode } from './ai'

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  provider: ProviderType
  model: string
  apiEndpoint: string
  shortcut: string
  screenshotQuality: number
  autoDeleteTimer: number
  appMode: AppMode
  privacyMode: boolean
  language: string
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
  shortcut: 'CommandOrControl+Shift+Space',
  screenshotQuality: 0.92,
  autoDeleteTimer: 30,
  appMode: 'quick-explain',
  privacyMode: true,
  language: 'en'
}

export const PROVIDER_MODELS: Record<ProviderType, string[]> = {
  gemini: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-3-pro-preview']
}

export const PROVIDER_ENDPOINTS: Record<ProviderType, string> = {
  gemini: 'https://generativelanguage.googleapis.com/v1beta'
}
