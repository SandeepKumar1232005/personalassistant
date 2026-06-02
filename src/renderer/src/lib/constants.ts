export const APP_NAME = 'SnapAssist AI'
export const APP_VERSION = '1.0.0'
export const DEFAULT_SHORTCUT = 'CommandOrControl+Shift+Space'

export const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  SETTINGS: '/settings',
  ABOUT: '/about',
  OVERLAY: '/overlay'
} as const

export const IPC_CHANNELS = {
  CAPTURE_START: 'capture:start',
  CAPTURE_COMPLETE: 'capture:complete',
  CAPTURE_CANCEL: 'capture:cancel',
  CAPTURE_REGION_SELECTED: 'capture:region-selected',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SHORTCUT_UPDATE: 'shortcut:update',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  PRIVACY_CLEANUP: 'privacy:cleanup'
} as const

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'ar', label: 'Arabic' }
]
